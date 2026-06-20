import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB         from './shared/config/db.js';
import { connectRedis }  from './shared/config/redis.js';
import AudienceRouter    from './src/AudienceRouter.js';
import { createLogger }  from './shared/utils/logger.js';

// Register all models referenced in populate() calls
import './shared/models/User.js';

dotenv.config();

const logger = createLogger('audience-service');
const app    = express();
const PORT   = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

await connectDB();
await connectRedis();

app.use('/audience', AudienceRouter);
app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'audience-service',
  uptime: process.uptime(), timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => logger.info('audience-service listening', { port: PORT }));
