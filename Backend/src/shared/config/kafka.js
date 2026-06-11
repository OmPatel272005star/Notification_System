import { Kafka, logLevel } from 'kafkajs';

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4 — Kafka KRaft client (no Zookeeper)
// KAFKA_BROKERS is set by Docker Compose: kafka:9092
// Falls back to localhost:9092 for local dev outside Docker.
// ─────────────────────────────────────────────────────────────────────────────

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

// ── Custom logger: maps KafkaJS internal levels → clear console output ────────
// This is what makes Kafka events visible in `docker compose logs backend`.
// Without this, KafkaJS silently swallows INFO/DEBUG internally.
const toLevel = {
  [logLevel.ERROR]: '❌ KAFKA ERROR',
  [logLevel.WARN]:  '⚠️  KAFKA WARN ',
  [logLevel.INFO]:  'ℹ️  KAFKA INFO ',
  [logLevel.DEBUG]: '🐛 KAFKA DEBUG',
};

function kafkaLogger(level) {
  return ({ namespace, label, log }) => {
    const { message, ...extra } = log;
    // Only print extras if they carry useful info (skip empty / noise objects)
    const hasExtra = Object.keys(extra).length > 0 &&
                     !(extra.timestamp) &&     // skip bare timestamp fields
                     JSON.stringify(extra) !== '{}';

    const prefix = toLevel[level] || 'KAFKA';
    const line   = `[${namespace}] ${message}`;
    if (hasExtra) {
      console.log(`${prefix}  ${line}`, JSON.stringify(extra));
    } else {
      console.log(`${prefix}  ${line}`);
    }
  };
}

export const kafka = new Kafka({
  clientId:  'notification-system',
  brokers,
  // INFO level → shows connect, produce, fetch (consume) events in backend logs
  logLevel:  logLevel.INFO,
  logCreator: () => kafkaLogger,
  // Retry config: exponential back-off, max 5 retries
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

// ── Singleton producer (shared by CampaignController + Scheduler) ─────────────
export const producer = kafka.producer({
  allowAutoTopicCreation: true,
});

// ── Consumer: notification-dispatcher (reads campaign.trigger) ────────────────
export const dispatchConsumer = kafka.consumer({
  groupId: 'notification-dispatch-group',
});

// ── Consumer: delivery-report handler (reads delivery.report → updates DB) ───
export const deliveryConsumer = kafka.consumer({
  groupId: 'delivery-report-group',
});

// ─────────────────────────────────────────────────────────────────────────────
// connectKafka()
// Call once at app startup — connects producer + both consumers.
// ─────────────────────────────────────────────────────────────────────────────
export async function connectKafka() {
  await producer.connect();
  console.log('✅ Kafka producer connected');

  await dispatchConsumer.connect();
  console.log('✅ Kafka dispatchConsumer connected');

  await deliveryConsumer.connect();
  console.log('✅ Kafka deliveryConsumer connected');
}

// ─────────────────────────────────────────────────────────────────────────────
// disconnectKafka()
// Graceful shutdown — call on SIGTERM / SIGINT.
// ─────────────────────────────────────────────────────────────────────────────
export async function disconnectKafka() {
  await producer.disconnect();
  await dispatchConsumer.disconnect();
  await deliveryConsumer.disconnect();
  console.log('Kafka connections closed.');
}
