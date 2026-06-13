import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// ── Phase 3 — Redis singleton shared by all services ─────────────────────────
// REDIS_URL set by Docker Compose: redis://redis:6379
// Falls back to localhost:6379 for dev outside Docker.
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect:       true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error',   (err) => console.error('Redis error:', err.message));

export async function connectRedis() {
  await redis.connect();
}
