import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'readysupply_super_secure_jwt_secret_dev_key_2026_xyz!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
  MAX_FILE_MB: parseInt(process.env.MAX_FILE_MB || '10', 10),
  EXPIRY_WARNING_DAYS: parseInt(process.env.EXPIRY_WARNING_DAYS || '30', 10),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@readysupply.in',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@ReadySupply2026!',
  SEED_DEMO: process.env.SEED_DEMO !== 'false',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

