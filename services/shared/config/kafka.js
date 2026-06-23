import { Kafka, logLevel } from 'kafkajs';

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

const toLevel = {
  [logLevel.ERROR]: '❌ KAFKA ERROR',
  [logLevel.WARN]:  '⚠️  KAFKA WARN ',
  [logLevel.INFO]:  'ℹ️  KAFKA INFO ',
  [logLevel.DEBUG]: '🐛 KAFKA DEBUG',
};

function kafkaLogger(level) {
  return ({ namespace, log }) => {
    const { message, ...extra } = log;
    const hasExtra = Object.keys(extra).length > 0 && JSON.stringify(extra) !== '{}';
    const prefix   = toLevel[level] || 'KAFKA';
    if (hasExtra) {
      console.log(`${prefix}  [${namespace}] ${message}`, JSON.stringify(extra));
    } else {
      console.log(`${prefix}  [${namespace}] ${message}`);
    }
  };
}

// ── SASL/SSL config for Upstash Kafka (production) ───────────────────────────
// When KAFKA_USERNAME is set (Railway/Upstash), use SASL + SSL.
// When not set (local Docker KRaft), plain connection is used.
const saslConfig = process.env.KAFKA_USERNAME
  ? {
      ssl: true,
      sasl: {
        mechanism: process.env.KAFKA_SASL_MECHANISM || 'scram-sha-256',
        username:  process.env.KAFKA_USERNAME,
        password:  process.env.KAFKA_PASSWORD,
      },
    }
  : {};

export const kafka = new Kafka({
  clientId:   process.env.KAFKA_CLIENT_ID || 'notification-system',
  brokers,
  ...saslConfig,
  logLevel:   logLevel.INFO,
  logCreator: () => kafkaLogger,
  retry: { initialRetryTime: 300, retries: 5 },
});

// ── Singletons — created per-service (only what each service needs) ────────────
export const producer = kafka.producer({ allowAutoTopicCreation: true });

export const dispatchConsumer = kafka.consumer({ groupId: 'notification-dispatch-group' });
export const deliveryConsumer  = kafka.consumer({ groupId: 'delivery-report-group'      });

// ── Connect helpers ───────────────────────────────────────────────────────────
export async function connectProducer() {
  await producer.connect();
  console.log('✅ Kafka producer connected');
}

export async function connectConsumers() {
  await dispatchConsumer.connect();
  console.log('✅ Kafka dispatchConsumer connected');
  await deliveryConsumer.connect();
  console.log('✅ Kafka deliveryConsumer connected');
}

export async function connectKafka() {
  await connectProducer();
  await connectConsumers();
}

export async function disconnectKafka() {
  await producer.disconnect();
  await dispatchConsumer.disconnect();
  await deliveryConsumer.disconnect();
  console.log('Kafka connections closed.');
}
