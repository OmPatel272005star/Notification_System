import express  from 'express';
import cors     from 'cors';
import dotenv   from 'dotenv';
import connectDB       from './shared/config/db.js';
import { connectRedis } from './shared/config/redis.js';
import AuthRouter      from './src/AuthRouter.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

await connectDB();
await connectRedis();

app.use('/auth', AuthRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'auth-service', uptime: process.uptime() }));

app.listen(PORT, () => console.log(`[auth-service] listening on :${PORT}`));
