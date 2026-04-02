const nodemailer = require('nodemailer');

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    return String(value).toLowerCase() === 'true';
};

const isMailConfigured = () => {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_FROM_EMAIL
    );
};

const createTransport = () => {
    if (!isMailConfigured()) {
        throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, and SMTP_FROM_EMAIL.');
    }

    const transportConfig = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: parseBoolean(process.env.SMTP_SECURE, Number(process.env.SMTP_PORT) === 465)
    };

    if (process.env.SMTP_USER) {
        transportConfig.auth = {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || ''
        };
    }

    return nodemailer.createTransport(transportConfig);
};

const sendMail = async ({ to, subject, html, text }) => {
    const transporter = createTransport();
    const fromName = process.env.SMTP_FROM_NAME || 'SXV Studio';
    const fromEmail = process.env.SMTP_FROM_EMAIL;

    return transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text,
        html
    });
};

module.exports = {
    isMailConfigured,
    sendMail
};
