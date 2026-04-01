const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_fallback_key');
const { User } = require('../models');

// Configure Product Prices (In a real app, use Stripe Price IDs from your Dashboard)
const PRICES = {
    'DJ': 'price_mock_dj_tier_299',
    'Pro DJ': 'price_mock_prodj_tier_999'
};

const createCheckoutSession = async (req, res) => {
    try {
        const { planTier } = req.body; 
        const user = req.user; // from authMiddlware

        if (!['DJ', 'Pro DJ'].includes(planTier)) {
            return res.status(400).json({ error: 'Invalid plan tier requested' });
        }

        const priceId = PRICES[planTier];

        // Ensure FRONTEND_URL exists for return path
        const origin = req.headers.origin || 'http://localhost:4200';

        let sessionConfig = {
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `SXV Studio ${planTier} Tier`,
                        },
                        unit_amount: planTier === 'DJ' ? 299 : 999, // cents
                        recurring: { interval: 'month' }
                    },
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
            cancel_url: `${origin}/dashboard?canceled=true`,
            metadata: {
                userId: user.id,
                tier: planTier
            }
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating Stripe Checkout session:', error);
        res.status(500).json({ error: error.message });
    }
};

const handleWebhook = async (req, res) => {
    const rawBody = req.rawBody; // Assumes we saved raw body
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

    let event;

    try {
        // Fallback for mock environments lacking a signature
        if (!sig || process.env.STRIPE_SECRET_KEY === undefined) {
            console.log("Mocking webhook validation bypass for dev environment");
            event = req.body; 
        } else {
            event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        }
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Fulfill the purchase, update the DB user tier
        const userId = session.metadata?.userId;
        const newTier = session.metadata?.tier;

        if (userId && newTier) {
            try {
                const user = await User.findByPk(userId);
                if (user) {
                    user.tier = newTier;
                    await user.save();
                    console.log(`Successfully upgraded user ${user.username} to ${newTier}`);
                }
            } catch (err) {
                console.error("DB Error updating tier after Stripe checkout", err);
            }
        }
    }

    res.json({received: true});
};

const verifySession = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) {
            return res.status(400).json({ error: 'No session_id provided' });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const userId = session.metadata?.userId;
            const newTier = session.metadata?.tier;

            if (userId && newTier) {
                const user = await User.findByPk(userId);
                if (user && user.tier !== newTier) {
                    user.tier = newTier;
                    await user.save();
                    console.log(`Verified Session: Successfully upgraded ${user.username} to ${newTier}`);
                    return res.json({ success: true, newTier, user: { tier: user.tier } });
                }
                return res.json({ success: true, message: 'Already upgraded', user: { tier: user.tier } });
            }
        }
        res.json({ success: false, message: 'Payment not successful yet' });
    } catch (error) {
        console.error('Error verifying Stripe session:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    verifySession
};
