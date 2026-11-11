import { env } from './config/env.js';

import { app } from './app.js';
import { logger } from './config/logger.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(
        `Server running on port ${env.PORT}\n` +
          `Local:   http://localhost:${env.PORT}\n` +
          `Health:  http://localhost:${env.PORT}/api/v1/health`
      );
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
