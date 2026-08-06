import jwt  from "jsonwebtoken"
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success:false, message: "Token requerido"})
    }

    const token = authHeader.split(' ')[1]

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        return res.status(401).json({ success:false, message: "Token de acceso invalido"})
    }

}