import dotenv from 'dotenv';
import { z } from 'zod';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';
import { logger } from './logger.js';

const nodeEnvSchema = z.enum(['development', 'production']);
export const nodeEnv = nodeEnvSchema.parse(process.env.NODE_ENV); //parse will throw error if node_env fail while comparing with nodeEnvSchema

dotenv.config({
  path: `.env.${nodeEnv}`,
  // quiet: true, //suppress it if you don't was to display in terminal
  // debug: true // for debugging
});

const baseSchema = z.object({
  PORT: z.coerce.number(),
  ALLOWED_ORIGINS: z
    .string()
    .min(1, { error: ERROR_MESSAGES.ALLOWED_ORIGINS })
    .refine(
      (value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .every((origin) => {
            try {
              new URL(origin);
              return true;
            } catch {
              return false;
            }
          }),
      { error: ERROR_MESSAGES.ALLOWED_ORIGINS }
    ),
  DB_URI: z.string().min(1, ERROR_MESSAGES.MISSING_DB_URI),
  JWT_SECRET: z.string().min(1, ERROR_MESSAGES.MISSING_JWT_SECRET),
  AUTH_SESSION_TOKEN_EXPIRY: z.string().min(1, ERROR_MESSAGES.MISSING_AUTH_SESSION_TOKEN_EXPIRY),
  AUTH_SESSION_COOKIE_AGE: z.coerce.number().int().positive(),
});

const developmentSchema = baseSchema.extend({});
const productionSchema = baseSchema.extend({});
// const testSchema = baseSchema.extend({})

const schemas = {
  development: developmentSchema,
  production: productionSchema,
  // testSchema: testSchema,
};

const envSchema = schemas[nodeEnv];

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.error('❌ Invalid environment variables:', result.error.format());
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
