import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB        from './shared/config/db.js';
import { connectRedis } from './shared/config/redis.js';
import UserRouter       from './src/UserRouter.js';
import ProfileRouter    from './src/ProfileRouter.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

await connectDB();
await connectRedis();

app.use('/user',    UserRouter);
app.use('/profile', ProfileRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'user-service', uptime: process.uptime() }));

app.listen(PORT, () => console.log(`[user-service] listening on :${PORT}`));