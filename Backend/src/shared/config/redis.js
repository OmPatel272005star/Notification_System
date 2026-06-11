import Redis from 'ioredis';

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 — Redis client singleton
// REDIS_URL is injected by Docker Compose (redis://redis:6379)
// Falls back to localhost for local dev without Docker
// ─────────────────────────────────────────────────────────────────────────────
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,  // fail fast if Redis is down (don't queue commands)
  lazyConnect: false,
});

redis.on('connect',   () => console.log('✅ Redis connected'));
redis.on('error',     (err) => console.error('❌ Redis error:', err.message));
redis.on('reconnecting', () => console.log('🔄 Redis reconnecting…'));
