import {Router} from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


const authRouter = Router()

const loginSchema = z.object({
    email: z.email("el email enviado no es valido"),
    password: z.string().min(8, "La clave es muy corta").max(24, "La clave es muy larga")
})

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({success: false, errors: result.error.flatten().fieldErrors})
    }
    req.validatedData = result.data
    next()
}


authRouter.post('/login', validate(loginSchema), async (req, res) => {
    const {email, password} = req.body
    // return res.status(200).json({message: "Inicio de session exitoso"})
    try {
        const student = await prisma.student.findUnique({where: {email}})
        if (!student) {
            return res.status(401).json({ success:false, message: "El email no ha sido encontrado"})
        }
        const isPasswordvalid = await bcrypt.compare(password, student.password)

        if (!isPasswordvalid) {
            return res.status(401).json({ success:false, message: "ña clave es invalidad"})
        }

        const payload = {id: student.id, email: student.email, studentCode: student.studentCode}
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '8h'})
        return res.status(200).json({ success:true, access_toke: token })

    } catch (error) {
        return res.status(500).json({ success: "Error del servidor" })
    }
})

export default authRouter