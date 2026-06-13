import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB         from './shared/config/db.js';
import { connectProducer, producer } from './shared/config/kafka.js';
import CampaignRouter    from './src/CampaignRouter.js';

// Register all models referenced in populate() calls — Mongoose requires
// every referenced model to be imported (registered) before populate runs.
import './shared/models/Template.js';   // template_id
import './shared/models/Connection.js'; // connection_id
import './shared/models/Audience.js';   // audience_ids
import './shared/models/User.js';       // created_by

dotenv.config();
const app  = express();
const PORT = process.env.PORT || 3005;
app.use(cors());
app.use(express.json());

await connectDB();
await connectProducer();   // only producer needed — no consumers in campaign-svc

app.use('/campaign', CampaignRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'campaign-service', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`[campaign-service] listening on :${PORT}`));

// Graceful shutdown
const shutdown = async (sig) => {
  console.log(`[campaign-service] ${sig} — shutting down`);
  await producer.disconnect();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
