import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB      from './shared/config/db.js';
import { connectRedis } from './shared/config/redis.js';
import TemplateRouter from './src/TemplateRouter.js';

// Register all models referenced in populate() calls — Mongoose requires
// every referenced model to be imported (registered) before populate runs.
import './shared/models/User.js';       // created_by, edit_history.edited_by

dotenv.config();
const app  = express();
const PORT = process.env.PORT || 3003;
app.use(cors());
app.use(express.json({ limit: '10mb' })); // GrapesJS project data can be large
await connectDB();
await connectRedis();
app.use('/template', TemplateRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'template-service', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`[template-service] listening on :${PORT}`));
