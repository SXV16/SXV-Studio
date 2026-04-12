const getAppBaseUrl = () => {
    const appBaseUrl = process.env.APP_BASE_URL;

    if (appBaseUrl) {
        return appBaseUrl.replace(/\/+$/, '');
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('APP_BASE_URL is required in production.');
    }

    return 'http://localhost:4200';
};

module.exports = { getAppBaseUrl };
