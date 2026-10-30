import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { mongoSanitizer } from './middleware/sanitize.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import actionRoutes from './routes/actionRoutes.js';
import packRoutes from './routes/packRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

export const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible PDF viewing and local dev proxy
}));

// CORS Configuration
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// HTTP Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// MongoDB operator sanitization
app.use(mongoSanitizer);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ReadySupply API',
    version: '1.0.0',
    mode: env.NODE_ENV,
    storageDriver: env.STORAGE_DRIVER,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);

// Catch 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'NotFound', message: `Route ${req.originalUrl} not found` });
});

// Centralized error handler
app.use(errorHandler);

