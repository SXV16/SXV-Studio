const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/create-checkout-session', authMiddleware, stripeController.createCheckoutSession);
router.get('/verify-session', authMiddleware, stripeController.verifySession);

// Webhook must be raw body depending on implementation, but express.raw can be attached from server.js
router.post('/webhook', express.raw({type: 'application/json'}), stripeController.handleWebhook);

module.exports = router;
