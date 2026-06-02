import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger';

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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), version: '1.0.0' });
});

// Global Error Handler (to be imported and used here)
// app.use(errorHandler);

export default app;
