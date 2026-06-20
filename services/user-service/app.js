import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB        from './shared/config/db.js';
import { connectRedis } from './shared/config/redis.js';
import UserRouter       from './src/UserRouter.js';
import ProfileRouter    from './src/ProfileRouter.js';
import { createLogger } from './shared/utils/logger.js';

dotenv.config();

const logger = createLogger('user-service');
const app    = express();
const PORT   = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

await connectDB();
await connectRedis();

app.use('/user',    UserRouter);
app.use('/profile', ProfileRouter);
app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'user-service',
  uptime: process.uptime(), timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => logger.info('user-service listening', { port: PORT }));