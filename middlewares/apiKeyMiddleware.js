const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY || 'vaccine2024';

    if (apiKey && apiKey === validApiKey) {
        next();
    } else {
        res.status(401).json({ message: 'Please provide valid API key' });
    }
};

module.exports = apiKeyMiddleware;