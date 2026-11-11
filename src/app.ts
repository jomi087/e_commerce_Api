import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ApiError } from './utils/ApiError.js';
import { corsOptions } from './config/cors.js';
import { SERVER_CONFIG } from './config/server.js';
import cookieParser from 'cookie-parser';

const app: Application = express();

// Security and utility middlewares
app.use(helmet());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json({ limit: SERVER_CONFIG.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: SERVER_CONFIG.URLENCODED_LIMIT }));
// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/api/v1', apiRouter);

// 404 Handler for unmatched routes
app.use((req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling middleware
app.use(errorHandler);

export { app };
export default app;
