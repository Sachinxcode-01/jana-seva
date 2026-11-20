import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { CONFIG } from './config.js';
import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import eligibilityRoutes from './routes/eligibilityRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';

const app = express();

// Disable Express fingerprinting
app.disable('x-powered-by');

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Managed by frontend hosting or proxy
  crossOriginEmbedderPolicy: false
}));

// Gzip/Deflate compression for fast network payloads
app.use(compression());

// Security and CORS configuration
const allowedOrigins = [CONFIG.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server) or recognized origins
    if (!origin || allowedOrigins.includes(origin) || CONFIG.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing with safe payload ceilings
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Global API rate limiting to protect against DoS and scrapers (120 req / minute per IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' }
});
app.use('/api/', apiLimiter);

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint (for load balancers and container monitors)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'JANASEVA API Gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'Ready',
    uptime: Math.round(process.uptime())
  });
});

// Mount Routes (supporting both legacy /api and standardized /api/v1 endpoints)
app.use(['/api/auth', '/api/v1/auth'], authRoutes);
app.use(['/api/schemes', '/api/v1/schemes'], schemeRoutes);
app.use(['/api/eligibility', '/api/v1/eligibility'], eligibilityRoutes);
app.use(['/api/user', '/api/users', '/api/v1/users'], userRoutes);
app.use(['/api/admin', '/api/v1/admin'], adminRoutes);
app.use(['/api/assistant', '/api/v1/assistant'], assistantRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Resource not found.' });
});

// Production-safe global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const isProd = CONFIG.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    message: isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error')
  });
});

const PORT = CONFIG.PORT;
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  JANASEVA BACKEND SERVER RUNNING ON PORT ${PORT}      `);
  console.log(`  API URL: http://localhost:${PORT}/api/health         `);
  console.log(`  Mode: ${CONFIG.NODE_ENV}                            `);
  console.log(`=======================================================`);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing JANASEVA HTTP server...');
  server.close(() => {
    console.log('JANASEVA HTTP server closed safely.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received: shutting down...');
  server.close(() => {
    console.log('JANASEVA HTTP server shut down.');
    process.exit(0);
  });
});

export default app;
export { app, server };
