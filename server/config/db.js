import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    let mongoUri = env.MONGODB_URI;
    let isMemory = false;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('[DB] No MONGODB_URI provided. Initializing in-memory MongoDB server...');
      mongodInstance = await MongoMemoryServer.create();
      mongoUri = mongodInstance.getUri();
      isMemory = true;
    }

    await mongoose.connect(mongoUri);

    if (isMemory) {
      console.log(`\n======================================================`);
      console.log(`[DB MODE] IN-MEMORY MONGODB ACTIVE`);
      console.log(`[DB URI]  ${mongoUri}`);
      console.log(`[DB NOTE] Data persists in memory for this session.`);
      console.log(`======================================================\n`);
    } else {
      console.log(`\n======================================================`);
      console.log(`[DB MODE] EXTERNAL MONGODB CONNECTED`);
      console.log(`[DB HOST] ${mongoose.connection.host}`);
      console.log(`======================================================\n`);
    }

    return { isMemory, uri: mongoUri };
  } catch (error) {
    console.error('[DB] Connection error:', error.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

export const isInMemoryDB = () => mongodInstance !== null;

