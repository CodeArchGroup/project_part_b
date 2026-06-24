/**
 * @file server.js
 * @description Express application entry point for the ITQAN Backend API.
 * Configures middleware, mounts all route modules, and starts the HTTP server.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/auth.routes');
const profileRoutes = require('./src/routes/profile.routes');
const aiRoutes = require('./src/routes/ai.routes');
const shariahRoutes = require('./src/routes/shariah.routes');
const goalsRoutes = require('./src/routes/goals.routes');
const adminRoutes = require('./src/routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/shariah', shariahRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Health check endpoint.
 * @route GET /health
 * @returns {object} 200 - JSON with status and message fields
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'ITQAN Backend API is running' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
