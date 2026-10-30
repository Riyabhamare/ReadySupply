import cron from 'node-cron';
import { app } from './app.js';
import { connectDB, isInMemoryDB } from './config/db.js';
import { env } from './config/env.js';
import { seedDatabase } from './seed/index.js';
import { recalculateExpiriesAndAlert } from './services/expiryService.js';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB (Atlas or in-memory fallback)
    const { isMemory } = await connectDB();

    // 2. Auto-seed if running in-memory or SEED_DEMO is true
    if (isMemory || env.SEED_DEMO) {
      console.log('[SERVER] Auto-running demo seed data...');
      await seedDatabase();
    }

    // 3. Schedule Daily Expiry Recalculation & Alert Job (Midnight every day)
    cron.schedule('0 0 * * *', async () => {
      console.log('[CRON] Running daily expiry recalculation and alert check...');
      try {
        await recalculateExpiriesAndAlert();
      } catch (err) {
        console.error('[CRON ERROR]', err.message);
      }
    });

    // Run initial expiry check on startup
    recalculateExpiriesAndAlert().catch(err => console.error('[STARTUP EXPIRY ERROR]', err.message));

    // 4. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 ReadySupply Server listening on port ${env.PORT}`);
      console.log(`   Mode:        ${env.NODE_ENV}`);
      console.log(`   Database:    ${isMemory ? 'In-Memory mongodb-memory-server' : 'External MongoDB'}`);
      console.log(`   Storage:     ${env.STORAGE_DRIVER}`);
      console.log(`   Client URL:  ${env.CLIENT_URL}`);
      console.log(`======================================================\n`);
    });

    return server;
  } catch (err) {
    console.error('[FATAL SERVER ERROR]', err);
    process.exit(1);
  }
};

startServer();

