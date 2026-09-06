import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import ctfRoutes from './routes/ctf.routes';
import eventsRoutes from './routes/events.routes';
import blogRoutes from './routes/blog.routes';
import usersRoutes from './routes/users.routes';
import announcementsRoutes from './routes/announcements.routes';
import progressRoutes from './routes/progress.routes';
import uploadRoutes from './routes/upload.routes';
import analyticsRoutes from './routes/analytics.routes';
import joinRoutes from './routes/join.routes';
import achievementsRoutes from './routes/achievements.routes';
import adminRoutes from './routes/admin.routes';
import contactRoutes from './routes/contact.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: true,
  strictTransportSecurity: true,
  xFrameOptions: { action: 'deny' },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const isAllowedOrigin = (origin: string) =>
  allowedOrigins.includes(origin) ||
  (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      // In development, you might want to allow all origins temporarily
      // callback(null, true); 
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ctf', ctfRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/announcements', announcementsRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/join', joinRoutes);
app.use('/api/v1/achievements', achievementsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/contact', contactRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), version: '1.0.0' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
