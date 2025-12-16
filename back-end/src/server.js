import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { attachUserIfPresent } from './middleware/auth.js';
import { getImage, hasImage } from './utils/imageCache.js';

// Import routes
import authRoutes from './routes/auth.js';
import foodLogRoutes from './routes/foodLog.js';
import workoutLogRoutes from './routes/workoutLog.js';
import aiRoutes from './routes/ai.js';
import statisticsRoutes from './routes/statistics.js';
import calendarRoutes from './routes/calendar.js';

const app = express();
const PORT = config.port;

// Trust proxy for Railway/production (needed for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for AI endpoints (more resource intensive)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 AI requests per windowMs
  message: 'Too many AI requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: config.corsOrigins === '*' ? '*' : config.corsOrigins,
  credentials: config.corsOrigins === '*' ? false : true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(attachUserIfPresent);

// Apply general rate limiter to all API routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Healthy Care Mobile API is running',
    timestamp: new Date().toISOString()
  });
});

// Temporary image endpoint
app.get('/temp-image/:imageId', (req, res) => {
  const { imageId } = req.params;
  
  if (!hasImage(imageId)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  const base64Image = getImage(imageId);
  const buffer = Buffer.from(base64Image, 'base64');
  
  res.set('Content-Type', 'image/jpeg');
  res.send(buffer);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes); // Also mount on /api/users for /api/users/me
app.use('/api/food-log', foodLogRoutes);
app.use('/api/workout-log', workoutLogRoutes);
app.use('/api/ai', aiLimiter, aiRoutes); // Stricter rate limit for AI
app.use('/api/statistics', statisticsRoutes);
app.use('/api/calendar', calendarRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Healthy Care Mobile API Server                     ║
║                                                          ║
║   🌐 URL: http://localhost:${PORT.toString().padEnd(29)} ║
║   ❤️  Health check: http://localhost:${PORT}/health${' '.repeat(12)} ║
║                                                          ║
║   📚 API Endpoints:                                      ║
║   • Authentication: /api/auth/*                          ║
║   • Food Log:       /api/food-log/*                      ║
║   • Workout Log:    /api/workout-log/*                   ║
║   • AI Services:    /api/ai/*                            ║
║   • Statistics:     /api/statistics/*                    ║
║                                                          ║
║   🔧 Environment: ${config.nodeEnv.toUpperCase().padEnd(29)} ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
