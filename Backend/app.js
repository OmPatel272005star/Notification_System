import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './src/config/db.js'
import AuthRouter    from './src/router/AuthRouter.js'
import UserRouter    from './src/router/UserRouter.js'
import ProfileRouter from './src/router/ProfileRouter.js'

dotenv.config()

const port = process.env.PORT || 3000
const app = express()

app.use(cors())
app.use(express.json({ limit: '500kb' }))   // bumped for base64 avatar payloads

await connectDB()

// ── Public auth routes (no JWT required) ──────────────────────────────────
app.use('/auth', AuthRouter)

// ── Protected user routes (JWT + role checked inside router) ──────────────
app.use('/user', UserRouter)

// ── Profile routes (JWT only — any authenticated user) ────────────────────
app.use('/profile', ProfileRouter)

app.listen(port, () => {
    console.log(`App is running on port ${port}`)
})
