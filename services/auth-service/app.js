import express  from 'express';
import cors     from 'cors';
import dotenv   from 'dotenv';
import connectDB       from './shared/config/db.js';
import { connectRedis } from './shared/config/redis.js';
import AuthRouter      from './src/AuthRouter.js';
import { createLogger } from './shared/utils/logger.js';

dotenv.config();

const logger = createLogger('auth-service');
const app    = express();
const PORT   = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

await connectDB();
await connectRedis();

app.use('/auth', AuthRouter);
app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'auth-service',
  uptime: process.uptime(), timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => logger.info(`auth-service listening`, { port: PORT }));
