// ─────────────────────────────────────────────────────────────────────────────
// Phase 6 — Shared Winston Logger
//
// Usage in any microservice:
//   import { createLogger } from './shared/utils/logger.js';
//   const logger = createLogger('template-service');
//   logger.info('Template created', { templateId, userId });
//   logger.error('DB error', { error: err.message });
// ─────────────────────────────────────────────────────────────────────────────

import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

/**
 * Creates a named Winston logger for a microservice.
 * All output is structured JSON — readable by log aggregators (Datadog, Grafana Loki, etc.)
 *
 * @param {string} service  - Service name e.g. 'campaign-service'
 * @returns {winston.Logger}
 */
export function createLogger(service) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service },
    format: combine(
      errors({ stack: true }),            // include stack traces on Error objects
      timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
      json()                              // structured JSON output
    ),
    transports: [
      new winston.transports.Console(),   // stdout → picked up by docker compose logs
    ],
    exitOnError: false,
  });
}
