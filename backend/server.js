require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();

// ====== Security Middleware ======
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ====== Body Parsing ======
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ====== Logging ======
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ====== API Routes ======
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// ====== Health Check ======
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ProFlow API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ====== API Documentation ======
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ProFlow API v1.0',
    endpoints: {
      auth: {
        'POST /api/auth/signup': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/me': 'Update profile',
        'PUT /api/auth/password': 'Change password',
      },
      projects: {
        'GET /api/projects': 'Get all user projects',
        'POST /api/projects': 'Create project',
        'GET /api/projects/:id': 'Get project with tasks',
        'PUT /api/projects/:id': 'Update project',
        'DELETE /api/projects/:id': 'Delete project + tasks',
      },
      tasks: {
        'GET /api/tasks': 'Get tasks (filter by project, status, priority)',
        'POST /api/tasks': 'Create task',
        'GET /api/tasks/:id': 'Get single task',
        'PUT /api/tasks/:id': 'Update task',
        'DELETE /api/tasks/:id': 'Delete task',
        'PATCH /api/tasks/:id/move': 'Move task (kanban)',
        'PATCH /api/tasks/:id/subtasks/:subtaskId': 'Toggle subtask',
      },
    },
  });
});

// ====== 404 Handler ======
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ====== Error Handler ======
app.use(errorHandler);

// ====== Start Server ======
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 ProFlow API running on port ${PORT}`);
    console.log(`📋 API docs: http://localhost:${PORT}/api`);
    console.log(`💚 Health:   http://localhost:${PORT}/api/health\n`);
  });
};

startServer();

module.exports = app;
