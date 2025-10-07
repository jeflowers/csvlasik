const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
// Load .env from the parent directory (project root)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import routes
const fs = require('fs');
const routesPath = path.join(__dirname, 'routes');

// Create Express app
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Load routes dynamically if they exist
if (fs.existsSync(routesPath)) {
  const routeFiles = fs.readdirSync(routesPath);
  routeFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const routeName = file.replace('.js', '');
      try {
        const route = require(path.join(routesPath, file));
        app.use(`/api/${routeName}`, route);
        console.log(`✓ Loaded route: /api/${routeName}`);
      } catch (err) {
        console.error(`✗ Failed to load route ${file}:`, err.message);
      }
    }
  });
}

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'ClearSight CMS Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/*'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║   ClearSight CMS Backend Server                                                                                          ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║   Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(24 - (process.env.NODE_ENV || 'development').length)}║
║   Port: ${PORT}${' '.repeat(31 - PORT.toString().length)}                                                                ║
║   API URL: http://localhost:${PORT}/api${' '.repeat(10 - PORT.toString().length)}                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;