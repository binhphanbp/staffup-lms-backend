import app from '@/app';
import { env } from '@/config/env.config';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';

const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Start Express server
    app.listen(env.PORT, () => {
      logger.info(`Docs URL: http://localhost:${env.PORT}/api/v1/docs`);
      logger.info(`OpenAPI URL: http://localhost:${env.PORT}/api/v1/openapi.json`);
      logger.info(`🚀 Server is running on port ${env.PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${env.PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION 💥 Shutting down...');
  logger.error(error.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('UNHANDLED REJECTION 💥 Shutting down...');
  logger.error(String(reason));
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
