const { sendMail } = require('./mailService');

const getAppBaseUrl = () => process.env.APP_BASE_URL || 'http://localhost:4200';

const sendVerificationEmail = async ({ email, token, username }) => {
    const verificationUrl = `${getAppBaseUrl()}/verify?token=${encodeURIComponent(token)}`;
    const safeName = username || 'there';

    return sendMail({
        to: email,
        subject: 'Verify your SXV Studio account',
        text: `Hi ${safeName}, verify your account here: ${verificationUrl}`,
        html: `
            <p>Hi ${safeName},</p>
            <p>Welcome to SXV Studio. Please verify your account to finish setup.</p>
            <p><a href="${verificationUrl}">Verify your account</a></p>
            <p>If the button does not work, paste this link into your browser:</p>
            <p>${verificationUrl}</p>
        `
    });
};

const sendPasswordResetEmail = async ({ email, token, username }) => {
    const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    const safeName = username || 'there';

    return sendMail({
        to: email,
        subject: 'Reset your SXV Studio password',
        text: `Hi ${safeName}, reset your password here: ${resetUrl}`,
        html: `
            <p>Hi ${safeName},</p>
            <p>We received a request to reset your SXV Studio password.</p>
            <p><a href="${resetUrl}">Reset your password</a></p>
            <p>This link expires in 1 hour.</p>
            <p>If the button does not work, paste this link into your browser:</p>
            <p>${resetUrl}</p>
        `
    });
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
