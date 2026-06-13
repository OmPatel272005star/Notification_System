import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB        from './shared/config/db.js';
import ConnectionRouter from './src/ConnectionRouter.js';

dotenv.config();
const app  = express();
const PORT = process.env.PORT || 3006;
app.use(cors());
app.use(express.json());
await connectDB();
app.use('/connections', ConnectionRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'connection-service', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`[connection-service] listening on :${PORT}`));
