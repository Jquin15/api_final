export const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key']

    if (!apiKey || apiKey !== process.env.APIKEY) {
        return res.status(401).json({message: "Unaothorized: Invalid API KEY"})
    }
    next();
}
