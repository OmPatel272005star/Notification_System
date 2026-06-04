import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './src/config/db.js'
import AuthRouter     from './src/router/AuthRouter.js'
import UserRouter     from './src/router/UserRouter.js'
import ProfileRouter  from './src/router/ProfileRouter.js'
import TemplateRouter from './src/router/TemplateRouter.js'
import AudienceRouter from './src/router/AudienceRouter.js'
import CampaignRouter    from './src/router/CampaignRouter.js'
import ConnectionRouter  from './src/router/ConnectionRouter.js'
import { startCampaignScheduler } from './src/workers/campaignScheduler.js'

dotenv.config()

const port = process.env.PORT || 3000
const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))   // bumped for base64 avatars + GrapesJS project data

await connectDB()

// ── Public auth routes (no JWT required) ──────────────────────────────────
app.use('/auth', AuthRouter)

// ── Protected user routes (JWT + role checked inside router) ──────────────
app.use('/user', UserRouter)

// ── Profile routes (JWT only — any authenticated user) ────────────────────
app.use('/profile', ProfileRouter)

// ── Template routes (read: any auth user | write: admin only) ─────────────
app.use('/template', TemplateRouter)

// ── Audience routes (admin only) ──────────────────────────────────────────
app.use('/audience', AudienceRouter)

// ── Campaign routes (read: any auth user | write: admin only) ─────────────
app.use('/campaign',    CampaignRouter)

// ── Connection routes (any authenticated user) ────────────────────────────
app.use('/connections', ConnectionRouter)

app.listen(port, () => {
    console.log(`App is running on port ${port}`)
    // Start background scheduler after server is up + DB is connected
    startCampaignScheduler()
})
