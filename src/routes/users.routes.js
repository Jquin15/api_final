import {Router} from 'express'
import prisma from '../lib/prisma.js'
import { z } from 'zod'
import  bcrypt from 'bcryptjs'
import {authMiddleware} from '../middleware/auth.middleware.js'

const userRouter = Router()

const studentSchema = z.object({
    studentCode: z.string().min(5, "El codigo del estudiante debe tener minimo 5 caracteres"),
    firstName: z.string().min(3, "El nombre del estudiante debe tener minimo 3 caracteres").max(20, "El nombre es muy largo"),
    lastName: z.string().min(3, "El apellido del estudiante debe tener minimo 5 caracteres").max(20, "El apellido es muy largo"),
    email: z.email("El email no tiene un formato valido"),
    password: z.string().min(8, "La clave es muy corta").max(24, "La clave es muy larga"),
    phone: z.string().optional(),
    birthDate: z.string().optional()
})

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({success: false, errors: result.error.flatten().fieldErrors})
    }
    req.validatedData = result.data
    next()
}


userRouter.get("/",  async (req, res) => {
    // BUSCAR EN LA BASE DE DATOS
    try {
        const students = await prisma.student.findMany()
        res.status(200).json({success: true, data: students})
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `error interno del servidor`
        })
    }

})

userRouter.post("/create", validate(studentSchema), async (req, res) => {
    const {studentCode, firstName, lastName, email, password, phone, birthDate} = req.body

    if (!studentCode || !firstName || !lastName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos: studentCode, firstName, lastName, email, password son obligatorios"
        })
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const newStudent = await prisma.student.create({
            data: {
                studentCode: studentCode,
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                phone: phone,
                birthDate: birthDate ? new Date(birthDate): null
            }
        })
        res.status(200).json({
            success: true,
            message: `nuevo alumno registrado exitosamente`
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `error interno del servidor`
        })
    }

})

userRouter.put("/update/:id", authMiddleware, validate(studentSchema), async (req, res) => {
    const id = req.params.id
    const {studentCode, firstName, lastName, email, password, phone, birthDate} = req.body

    if (!studentCode || !firstName || !lastName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos: studentCode, firstName, lastName, email, password son obligatorios"
        })
    }

    try {
        const updatedStudent = await prisma.student.update({
            where: {id: parseInt(id)},
            data: {
                studentCode: studentCode,
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                phone: phone,
                birthDate: birthDate ? new Date(birthDate): null
            }
        })
        res.status(200).json({
            success: true,
            message: `nuevo alumno actualizado exitosamente`
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `error interno del servidor`
        })
    }
})

userRouter.delete("/delete/:id", authMiddleware, async (req, res) => {
    const id = req.params.id

    if (!id) {
        return res.status(400).json({
            success: false,
            mensaje: "Faltan datos"
        })
    }

    try {
        const deleteStudent = await prisma.student.delete({
            where: {id: parseFloat(id)}
        })
        res.status(200).json({
            success: true,
            message: deleteStudent
        })
    } catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({
                success: false,
                mensaje: `EL id no fue encontrado`,
            })
        }
        res.status(200).json({
            success: false,
            mensaje: `El registro con ${id} se ha eliminado`,
        })
    }


})

export default userRouter
