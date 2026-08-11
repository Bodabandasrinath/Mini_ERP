import app from './app';
import { config } from './config';
import { prisma } from './config/prisma';

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma ORM.');

    app.listen(config.port, () => {
      console.log(`🚀 Mini ERP + CRM Backend running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
