import { env } from './env.js';

const allowedOrigins = env.ALLOWED_ORIGINS.split(','); // will convert string to array of url

export const corsOptions = {
  origin: allowedOrigins, // here the origin will validate wether the upcoming url is allowed by comparing this array of url
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
};
