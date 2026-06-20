import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB         from './shared/config/db.js';
import { connectProducer, producer } from './shared/config/kafka.js';
import CampaignRouter    from './src/CampaignRouter.js';
import { createLogger }  from './shared/utils/logger.js';

// Register all models referenced in populate() calls
import './shared/models/Template.js';
import './shared/models/Connection.js';
import './shared/models/Audience.js';
import './shared/models/User.js';

dotenv.config();

const logger = createLogger('campaign-service');
const app    = express();
const PORT   = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

await connectDB();
await connectProducer();

app.use('/campaign', CampaignRouter);
app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'campaign-service',
  uptime: process.uptime(), timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => logger.info('campaign-service listening', { port: PORT }));

// Graceful shutdown
const shutdown = async (sig) => {
  logger.info(`${sig} received — shutting down`, { service: 'campaign-service' });
  await producer.disconnect();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
