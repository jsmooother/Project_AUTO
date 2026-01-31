/**
 * Structured JSON logger (pino). All logs should include correlation context where available.
 */

import pino from "pino";

export type LoggerOptions = {
  /** Base context (e.g. customerId, jobId) included in every log line. */
  base?: Record<string, string>;
  level?: string;
};

export function createLogger(options: LoggerOptions = {}): pino.Logger {
  return pino({
    level: options.level ?? process.env["LOG_LEVEL"] ?? "info",
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: options.base ?? {},
  });
}
