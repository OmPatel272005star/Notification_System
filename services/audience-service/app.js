import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB         from './shared/config/db.js';
import { connectRedis }  from './shared/config/redis.js';
import AudienceRouter   from './src/AudienceRouter.js';

// Register all models referenced in populate() calls — Mongoose requires
// every referenced model to be imported (registered) before populate runs.
import './shared/models/User.js';     // created_by, last_edited_by, edit_history.edited_by

dotenv.config();
const app  = express();
const PORT = process.env.PORT || 3004;
app.use(cors());
app.use(express.json());
await connectDB();
await connectRedis();
app.use('/audience', AudienceRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'audience-service', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`[audience-service] listening on :${PORT}`));
