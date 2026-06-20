import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB         from './shared/config/db.js';
import { connectRedis }  from './shared/config/redis.js';
import ConnectionRouter  from './src/ConnectionRouter.js';
import { createLogger }  from './shared/utils/logger.js';

// Register all models referenced in populate() calls
import './shared/models/User.js';

dotenv.config();

const logger = createLogger('connection-service');
const app    = express();
const PORT   = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

await connectDB();
await connectRedis();

app.use('/connections', ConnectionRouter);
app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'connection-service',
  uptime: process.uptime(), timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => logger.info('connection-service listening', { port: PORT }));
