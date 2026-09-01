const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/plants',        require('./routes/plants'));
app.use('/api/containers',    require('./routes/containers'));
app.use('/api/gardens',       require('./routes/gardens'));
app.use('/api/posts',         require('./routes/posts'));
app.use('/api/reminders',     require('./routes/reminders'));
app.use('/api/soil',          require('./routes/soil'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/weather',       require('./routes/weather'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/stats',         require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HariVriksh API running',
    version: '2.0.0',
    timestamp: new Date(),
    features: ['auth', 'plants', 'gardens', 'community', 'reminders', 'ai-chat', 'weather', 'image-upload', 'notifications']
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harivriksh')
  .then(() => {
    console.log('✅ MongoDB connected');
    require('./seedData')();
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🌿 ─────────────────────────────────────────
   HariVriksh API v2.0 running on port ${PORT}
   http://localhost:${PORT}/api/health
🌿 ─────────────────────────────────────────
  `);
});

module.exports = app;
