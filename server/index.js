import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import authRoutes from './routes/auth.js';
import { setupWebSocket } from './utils/websocket.js';

const app = express();
const server = createServer(app);

// Security
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, try again later' }
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authLimiter, authRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mock API routes (from original)
app.get('/api/overview', (req, res) => {
  res.json({
    criticalAlerts: {
      count: 3,
      subtitle: 'Requires immediate attention',
      affectedParameters: [
        { id: 1, name: 'Temperature Control', checked: false },
        { id: 2, name: 'Pressure System', checked: false },
        { id: 3, name: "CD's", checked: false }
      ]
    },
    warnings: {
      count: 3,
      subtitle: 'Monitoring required',
      affectedParameters: [
        { id: 1, name: 'Coolant Flow', checked: false },
        { id: 2, name: 'Humidity Level', checked: false },
        { id: 3, name: 'Material Feed', checked: false }
      ]
    }
  });
});

app.get('/api/recommendations', (req, res) => {
  res.json([
    { id: 1, title: 'Temperature Control Frequency', impact: 'High Impact' },
    { id: 2, title: 'Calibration Procedure', impact: 'High Impact' },
    { id: 3, title: 'Material Feed Rate', impact: 'Medium Impact' },
    { id: 4, title: 'Operator Training', impact: 'Medium Impact' },
    { id: 5, title: 'Humidity Control', impact: 'Low Impact' }
  ]);
});

// WebSocket
setupWebSocket(server);

// Connect to MongoDB and start server
mongoose.connect(config.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Start server without DB for development
    server.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT} (no DB)`);
    });
  });
