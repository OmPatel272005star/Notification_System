import express    from 'express'
import dotenv     from 'dotenv'
import cors       from 'cors'
import rateLimit  from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

// ── Phase 1: imports from new service-boundary structure ──────────────────────
import connectDB         from './src/shared/config/db.js'
import { redis }         from './src/shared/config/redis.js'           // Phase 3
import { connectKafka, disconnectKafka } from './src/shared/config/kafka.js'  // Phase 4
import { startNotificationDispatcher } from './src/services/notification-dispatcher/index.js'  // Phase 4
import AuthRouter        from './src/services/auth/AuthRouter.js'
import UserRouter        from './src/services/user/UserRouter.js'
import ProfileRouter     from './src/services/user/ProfileRouter.js'
import TemplateRouter    from './src/services/template/TemplateRouter.js'
import AudienceRouter    from './src/services/audience/AudienceRouter.js'
import CampaignRouter    from './src/services/campaign/CampaignRouter.js'
import ConnectionRouter  from './src/services/connection/ConnectionRouter.js'
import { startCampaignScheduler } from './src/services/scheduler/campaignScheduler.js'

dotenv.config()

const port = process.env.PORT || 3000
const app  = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))   // bumped for base64 avatars + GrapesJS project data

await connectDB()

// ── Phase 4: Connect Kafka (producer + consumers) before starting server ─────
await connectKafka()

// ── Phase 3: Redis-backed rate limiter (100 req / min / IP) ─────────────────
const limiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max:      100,         // max requests per window per IP
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: 'Too many requests, please try again in a minute.' },
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: 'rate:',  // key pattern: rate:{ip}
    }),
})
app.use(limiter)

// ── Health check (used by Docker Compose healthcheck & Phase 6 Prometheus) ──
app.get('/health', (req, res) => {
    res.json({
        status:  'ok',
        service: 'backend',
        uptime:  process.uptime(),
        timestamp: new Date().toISOString(),
    })
})

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

const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`)
    // Phase 4: Start Notification Dispatcher (Kafka consumer) after server is up
    startNotificationDispatcher()
    // Start background scheduler after server is up + DB is connected
    startCampaignScheduler()
})

// ── Graceful shutdown — disconnect Kafka cleanly on process exit ────────────
async function shutdown(signal) {
    console.log(`\n[app] ${signal} received — shutting down gracefully…`)
    server.close(async () => {
        await disconnectKafka()
        process.exit(0)
    })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
