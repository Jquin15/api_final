import express from   'express'
import "dotenv/config"
import userRouter from './routes/users.routes.js'
import authRouter from './routes/auth.routes.js'
import { apiKeyMiddleware } from './middleware/apikey.middleware.js'

const app = express()
const port = process.env.PORT

app.use(express.json())

app.use(apiKeyMiddleware)

app.use("/", userRouter)
app.use("/auth", authRouter)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.listen(port, ()=>{
    console.log('servidor corriendo en el port: ' + port);
})
