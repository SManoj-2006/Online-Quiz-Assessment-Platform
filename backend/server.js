import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedData } from './config/seed.js';
import authRoutes from './routes/auth.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// Load Environment Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for headers and credentials
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Route Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: process.env.DB_FALLBACK_TO_JSON === 'true' ? 'hybrid (fallback ready)' : 'standard'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  await seedData();
  
  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}...`);
    console.log(`Health Check URL: http://localhost:${PORT}/api/health`);
  });
};

startServer();
