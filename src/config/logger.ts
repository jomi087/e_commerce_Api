import { mkdirSync } from 'node:fs';
import { createLogger, format, transports } from 'winston';

mkdirSync('logs', { recursive: true });
mkdirSync('logs/error', { recursive: true });
mkdirSync('logs/combined', { recursive: true });

const isProd = process.env.NODE_ENV === 'production';

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp, context, stack, ...meta }) => {
    const ctx = context ? `[${context}] ` : '';

    const msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;

    const extra = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';

    const stackTrace = stack ? `\n${stack}` : '';

    return `${timestamp}  ${level}  ${ctx}${msg}${stackTrace}${extra}`;
  })
);

const winstonConfig = {
  level: isProd ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // error.log → Stores only ERROR logs.
    // Useful for quickly finding failures that require investigation.
    new transports.File({
      filename: 'logs/error/error.log',
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB per file
      maxFiles: 5, // keep 5 rotated files (error.log, error1.log, ...)
    }),
    // combined.log → Stores normal and important application activity:
    // INFO, WARN, and ERROR logs. Useful for understanding the full
    // history/context of what happened in the application.
    new transports.File({
      filename: 'logs/combined/combined.log',
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10 MB per file
      maxFiles: 5,
    }),
    ...(!isProd
      ? [
          new transports.Console({
            level: 'debug',
            format: consoleFormat,
          }),
        ]
      : [
          new transports.Console({
            level: 'http',
            format: consoleFormat,
          }),
        ]),
  ],
};

export const logger = createLogger(winstonConfig);
