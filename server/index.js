require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./src/models');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DevHub API is running', timestamp: new Date().toISOString() });
});

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/candidates', require('./src/routes/candidates'));
app.use('/api/employer', require('./src/routes/employer'));
app.use('/api/jobs', require('./src/routes/jobs'));
app.use('/api/project-jobs', require('./src/routes/projectJobs'));
app.use('/api/applications', require('./src/routes/applications'));
app.use('/api/workspaces', require('./src/routes/workspaces'));
app.use('/api/tasks', require('./src/routes/tasks'));
app.use('/api/skills', require('./src/routes/skills'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    // In development, sync models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Models synced');
    }
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
