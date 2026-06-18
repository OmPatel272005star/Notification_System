import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB        from './shared/config/db.js';
import { connectRedis } from './shared/config/redis.js';
import ConnectionRouter from './src/ConnectionRouter.js';

// Register all models referenced in populate() calls — Mongoose requires
// every referenced model to be imported (registered) before populate runs.
import './shared/models/User.js';     // created_by field on Connection

dotenv.config();
const app  = express();
const PORT = process.env.PORT || 3006;
app.use(cors());
app.use(express.json());
await connectDB();
await connectRedis();
app.use('/connections', ConnectionRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'connection-service', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`[connection-service] listening on :${PORT}`));
