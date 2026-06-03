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
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: true,
  strictTransportSecurity: true,
  xFrameOptions: { action: 'deny' },
}));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), version: '1.0.0' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
