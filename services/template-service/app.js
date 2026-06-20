import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB         from './shared/config/db.js';
import { connectRedis }  from './shared/config/redis.js';
import TemplateRouter    from './src/TemplateRouter.js';
import { createLogger }  from './shared/utils/logger.js';

// Register all models referenced in populate() calls
import './shared/models/User.js';

dotenv.config();

const logger = createLogger('template-service');
const app    = express();
const PORT   = process.env.PORT || 3003;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

await connectDB();
await connectRedis();

app.use('/template', TemplateRouter);
app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'template-service',
  uptime: process.uptime(), timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => logger.info('template-service listening', { port: PORT }));
