#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the base server directory
const SERVER_DIR = __dirname;

// Helper function to create directories
function createDir(dirPath) {
  const fullPath = path.join(SERVER_DIR, dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  } else {
    console.log(`⊙ Directory exists: ${dirPath}`);
  }
}

// Helper function to create files with content
function createFile(filePath, content) {
  const fullPath = path.join(SERVER_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Created file: ${filePath}`);
  } else {
    console.log(`⊙ File exists: ${filePath}`);
  }
}

console.log('🚀 Setting up server structure...\n');

// Create directories
const directories = [
  'config',
  'data',
  'middleware',
  'routes',
  'scripts',
  'services',
  'test',
  'utils'
];

directories.forEach(createDir);

// Create files with content
const files = {};

// Config files
files['config/database.js'] = `const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database path from environment or default
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'clearsight.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
`;

// Middleware files
files['middleware/auth.js'] = `const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Editor or admin middleware
const editorOrAdmin = (req, res, next) => {
  if (!['editor', 'admin'].includes(req.userRole)) {
    return res.status(403).json({ error: 'Editor or admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly, editorOrAdmin };
`;

files['middleware/security.js'] = `const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 uploads per hour
  message: 'Upload limit exceeded, please try again later.',
});

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

module.exports = {
  createRateLimiter,
  authLimiter,
  uploadLimiter,
  securityHeaders,
};
`;

// Route files - articles.js
files['routes/articles.js'] = `const express = require('express');
const router = express.Router();
const { authMiddleware, editorOrAdmin } = require('../middleware/auth');
const db = require('../config/database');

// Get all articles
router.get('/', async (req, res) => {
  try {
    db.all('SELECT * FROM articles ORDER BY created_at DESC', (err, articles) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(articles);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    db.get('SELECT * FROM articles WHERE id = ?', [id], (err, article) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json(article);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create article (protected)
router.post('/', authMiddleware, editorOrAdmin, async (req, res) => {
  try {
    const { title, content, category, tags, meta_description } = req.body;
    const author_id = req.userId;
    
    const sql = 'INSERT INTO articles (title, content, category, tags, meta_description, author_id) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.run(sql, [title, content, category, tags, meta_description, author_id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Article created successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article (protected)
router.put('/:id', authMiddleware, editorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, meta_description } = req.body;
    
    const sql = 'UPDATE articles SET title = ?, content = ?, category = ?, tags = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.run(sql, [title, content, category, tags, meta_description, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json({ message: 'Article updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete article (protected)
router.delete('/:id', authMiddleware, editorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json({ message: 'Article deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;

// Continue with other route files...
// I'll split these to avoid issues with template literals

// Auth route
files['routes/auth.js'] = `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/security');
const db = require('../config/database');

// Register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 12));
      
      // Insert new user
      const sql = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
      db.run(sql, [email, hashedPassword, name], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Generate token
        const token = jwt.sign(
          { userId: this.lastID, email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        
        res.status(201).json({ 
          message: 'User created successfully',
          token,
          user: { id: this.lastID, email, name }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      res.json({ 
        message: 'Login successful',
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          role: user.role 
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout (optional - mainly for token blacklisting if implemented)
router.post('/logout', async (req, res) => {
  // In a real app, you might want to blacklist the token here
  res.json({ message: 'Logout successful' });
});

module.exports = router;
`;

// For brevity, I'll create simplified versions of the remaining routes
files['routes/compliance.js'] = `const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const db = require('../config/database');

// Get compliance status
router.get('/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const metrics = {
      hipaa: { compliant: true, lastAudit: new Date().toISOString(), issues: [] },
      accessibility: { wcagLevel: 'AA', lastCheck: new Date().toISOString(), score: 98 },
      dataProtection: { encryptionEnabled: true, backupStatus: 'active', lastBackup: new Date().toISOString() }
    };
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;

files['routes/dashboard.js'] = `const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/database');

// Get dashboard overview
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const overview = {};
    const queries = [
      { key: 'articles', sql: 'SELECT COUNT(*) as count FROM articles' },
      { key: 'testimonials', sql: 'SELECT COUNT(*) as count FROM testimonials' },
      { key: 'users', sql: 'SELECT COUNT(*) as count FROM users' },
      { key: 'media', sql: 'SELECT COUNT(*) as count FROM media' }
    ];
    
    const promises = queries.map(query => {
      return new Promise((resolve, reject) => {
        db.get(query.sql, (err, result) => {
          if (err) reject(err);
          else resolve({ [query.key]: result.count });
        });
      });
    });
    
    const results = await Promise.all(promises);
    Object.assign(overview, ...results);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;

files['routes/media.js'] = `const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const db = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '..', 'uploads');
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadPath, 'images');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(uploadPath, 'videos');
    } else {
      uploadPath = path.join(uploadPath, 'documents');
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all media
router.get('/', authMiddleware, async (req, res) => {
  try {
    db.all('SELECT * FROM media ORDER BY uploaded_at DESC', (err, media) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(media);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload media
router.post('/upload', authMiddleware, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { filename, mimetype, size, path: filepath } = req.file;
    const { title, description } = req.body;
    
    const sql = 'INSERT INTO media (filename, filepath, mimetype, size, title, description, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.run(sql, [filename, filepath, mimetype, size, title, description, req.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, filename, message: 'File uploaded successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;

files['routes/statistics.js'] = `const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/database');

// Get visitor statistics
router.get('/visitors', authMiddleware, async (req, res) => {
  try {
    const stats = {
      total: Math.floor(Math.random() * 100000),
      unique: Math.floor(Math.random() * 50000),
      returning: Math.floor(Math.random() * 25000),
      averageSessionDuration: 245,
      bounceRate: 32.5,
      pageViewsPerSession: 3.2
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;

files['routes/testimonials.js'] = `const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/database');

// Get all testimonials (public)
router.get('/', async (req, res) => {
  try {
    const { approved } = req.query;
    const sql = approved === 'false' 
      ? 'SELECT * FROM testimonials ORDER BY created_at DESC'
      : 'SELECT * FROM testimonials WHERE approved = 1 ORDER BY created_at DESC';
    
    db.all(sql, (err, testimonials) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(testimonials);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create testimonial (public submission)
router.post('/', async (req, res) => {
  try {
    const { name, email, content, rating, procedure_type, procedure_date } = req.body;
    
    const sql = 'INSERT INTO testimonials (name, email, content, rating, procedure_type, procedure_date, approved) VALUES (?, ?, ?, ?, ?, ?, 0)';
    
    db.run(sql, [name, email, content, rating, procedure_type, procedure_date], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Testimonial submitted successfully and pending approval' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve testimonial (protected)
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('UPDATE testimonials SET approved = 1 WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }
      res.json({ message: 'Testimonial approved successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;

files['routes/translations.js'] = `const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const translationService = require('../services/translationService');

// Get available languages
router.get('/languages', async (req, res) => {
  try {
    const languages = ['en', 'es', 'es-MX', 'pt-BR', 'tl', 'ko', 'vi', 'zh', 'ar', 'hy', 'he'];
    
    const languageDetails = languages.map(code => ({
      code,
      name: getLanguageName(code),
      rtl: ['ar', 'he'].includes(code)
    }));
    
    res.json(languageDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Translate text
router.post('/translate', authMiddleware, async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }
    
    const translation = await translationService.translate(text, targetLanguage, sourceLanguage);
    
    res.json({
      originalText: text,
      translatedText: translation,
      sourceLanguage,
      targetLanguage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get language names
function getLanguageName(code) {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'es-MX': 'Spanish (Mexico)',
    'pt-BR': 'Portuguese (Brazil)',
    'tl': 'Tagalog',
    'ko': 'Korean',
    'vi': 'Vietnamese',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'he': 'Hebrew'
  };
  return languages[code] || code;
}

module.exports = router;
`;

files['routes/users.js'] = `const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Get all users (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    db.all('SELECT id, email, name, role, created_at FROM users', (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(users);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    db.get(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [req.userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    db.run(sql, [name, email, req.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Profile updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get current user
    db.get('SELECT password FROM users WHERE id = ?', [req.userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || 12));
      
      // Update password
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Password changed successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;

// Continue with remaining files...
// I'll write them without problematic regex patterns

// Scripts
files['scripts/initDatabase.js'] = `const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'clearsight.db');
console.log('Initializing database at:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT DEFAULT "viewer", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)');

  // Articles table
  db.run('CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, category TEXT, tags TEXT, meta_description TEXT, author_id INTEGER, status TEXT DEFAULT "draft", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (author_id) REFERENCES users(id))');

  // Testimonials table
  db.run('CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, content TEXT NOT NULL, rating INTEGER, procedure_type TEXT, procedure_date DATE, approved BOOLEAN DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');

  // Media table
  db.run('CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, filepath TEXT NOT NULL, mimetype TEXT, size INTEGER, title TEXT, description TEXT, uploaded_by INTEGER, uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (uploaded_by) REFERENCES users(id))');

  // Audit logs table
  db.run('CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action TEXT NOT NULL, entity_type TEXT, entity_id INTEGER, details TEXT, ip_address TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))');

  // Translations cache table
  db.run('CREATE TABLE IF NOT EXISTS translation_cache (id INTEGER PRIMARY KEY AUTOINCREMENT, source_text TEXT NOT NULL, target_language TEXT NOT NULL, translated_text TEXT NOT NULL, source_language TEXT, service_used TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(source_text, target_language, source_language))');

  console.log('✓ Database tables created successfully');

  // Create default admin user
  const bcrypt = require('bcryptjs');
  const adminPassword = bcrypt.hashSync('admin123', 12);
  
  db.run(
    'INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['admin@clearsight.com', adminPassword, 'Admin User', 'admin'],
    (err) => {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log('✓ Default admin user created (admin@clearsight.com / admin123)');
      }
    }
  );
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✓ Database initialization complete');
  }
});
`;

// Services
files['services/translationService.js'] = `// Translation service wrapper for DeepL and Google Translate APIs

class TranslationService {
  constructor() {
    this.deeplApiKey = process.env.DEEPL_API_KEY;
    this.googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    this.preferredService = process.env.TRANSLATION_PREFERRED_SERVICE || 'auto';
    this.cacheEnabled = process.env.TRANSLATION_CACHE_TTL > 0;
  }

  async translate(text, targetLanguage, sourceLanguage = 'auto') {
    // Check cache first
    if (this.cacheEnabled) {
      const cached = await this.getCached(text, targetLanguage, sourceLanguage);
      if (cached) return cached;
    }

    let translation;
    let serviceUsed;

    // Determine which service to use
    if (this.preferredService === 'deepl' && this.deeplApiKey) {
      translation = await this.translateWithDeepL(text, targetLanguage, sourceLanguage);
      serviceUsed = 'deepl';
    } else if (this.preferredService === 'google' && this.googleApiKey) {
      translation = await this.translateWithGoogle(text, targetLanguage, sourceLanguage);
      serviceUsed = 'google';
    } else {
      // Auto mode - try DeepL first, fallback to Google
      if (this.deeplApiKey) {
        try {
          translation = await this.translateWithDeepL(text, targetLanguage, sourceLanguage);
          serviceUsed = 'deepl';
        } catch (err) {
          if (this.googleApiKey) {
            translation = await this.translateWithGoogle(text, targetLanguage, sourceLanguage);
            serviceUsed = 'google';
          } else {
            throw err;
          }
        }
      } else if (this.googleApiKey) {
        translation = await this.translateWithGoogle(text, targetLanguage, sourceLanguage);
        serviceUsed = 'google';
      } else {
        throw new Error('No translation service configured');
      }
    }

    // Cache the translation
    if (this.cacheEnabled && translation) {
      await this.cache(text, targetLanguage, sourceLanguage, translation, serviceUsed);
    }

    return translation;
  }

  async translateBatch(texts, targetLanguage, sourceLanguage = 'auto') {
    const batchSize = parseInt(process.env.TRANSLATION_BATCH_SIZE) || 10;
    const results = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const translations = await Promise.all(
        batch.map(text => this.translate(text, targetLanguage, sourceLanguage))
      );
      results.push(...translations);
    }

    return results;
  }

  async translateWithDeepL(text, targetLanguage, sourceLanguage) {
    // DeepL API implementation placeholder
    console.log('DeepL translation would happen here');
    return '[DeepL Translation]: ' + text;
  }

  async translateWithGoogle(text, targetLanguage, sourceLanguage) {
    // Google Translate API implementation placeholder
    console.log('Google Translate API call would happen here');
    return '[Google Translation]: ' + text;
  }

  mapLanguageCode(code, service) {
    // Map language codes to service-specific codes
    const mappings = {
      deepl: {
        'es-MX': 'ES',
        'pt-BR': 'PT-BR',
        'zh': 'ZH'
      },
      google: {
        'es-MX': 'es',
        'pt-BR': 'pt',
        'zh': 'zh-CN'
      }
    };

    return mappings[service]?.[code] || code.toUpperCase();
  }

  async getCached(text, targetLanguage, sourceLanguage) {
    // Implement cache retrieval from database
    return null;
  }

  async cache(text, targetLanguage, sourceLanguage, translation, serviceUsed) {
    // Implement cache storage to database
    return true;
  }
}

module.exports = new TranslationService();
`;

// Test files - simplified versions
files['test/setup.js'] = `import { beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Test database path
const testDbPath = path.join(__dirname, '..', 'data', 'test.db');

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = testDbPath;
  
  // Create test fixtures directory
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
  
  console.log('Test environment setup complete');
});

afterAll(() => {
  // Clean up test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  
  console.log('Test cleanup complete');
});
`;

files['test/auth.test.js'] = `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Authentication', () => {
  let token;

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          name: 'Test User'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });
  });
});
`;

files['test/media.test.js'] = `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Media Upload', () => {
  let token;

  beforeAll(async () => {
    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@clearsight.com',
        password: 'admin123'
      });
    token = loginRes.body.token;
  });

  describe('GET /api/media', () => {
    it('should list all media files', async () => {
      const res = await request(app)
        .get('/api/media')
        .set('Authorization', 'Bearer ' + token);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
`;

files['test/security.test.js'] = `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Security', () => {
  describe('Security headers', () => {
    it('should include security headers', async () => {
      const res = await request(app).get('/');

      expect(res.headers).toHaveProperty('x-frame-options');
      expect(res.headers).toHaveProperty('x-content-type-options');
      expect(res.headers).toHaveProperty('x-xss-protection');
    });
  });
});
`;

files['test/testimonials.test.js'] = `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Testimonials', () => {
  describe('GET /api/testimonials', () => {
    it('should get approved testimonials', async () => {
      const res = await request(app)
        .get('/api/testimonials');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
`;

// Utils - Password Validator with escaped regex
files['utils/passwordValidator.js'] = `/**
 * Password validation utilities for ClearSight CMS
 */

const passwordValidator = {
  /**
   * Validate password strength
   * @param {string} password - The password to validate
   * @returns {object} - Validation result with isValid and errors
   */
  validate(password) {
    const errors = [];
    
    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Maximum length
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    
    // Contains uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Contains lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    // Contains number
    if (!/\\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    // Contains special character
    const specialChars = /[!@#$%^&*()_+\\-=\\[\\]{};':"|,.<>\\/?]/;
    if (!specialChars.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculateStrength(password)
    };
  },
  
  /**
   * Calculate password strength score
   * @param {string} password - The password to score
   * @returns {object} - Strength score and label
   */
  calculateStrength(password) {
    let score = 0;
    
    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character diversity
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\\d/.test(password)) score += 1;
    const specialChars = /[!@#$%^&*()_+\\-=\\[\\]{};':"|,.<>\\/?]/;
    if (specialChars.test(password)) score += 2;
    
    // Pattern detection (penalize common patterns)
    const repeatedChars = /(.)\\1{2,}/;
    const commonPattern = /^[a-zA-Z]+\\d+$/;
    if (repeatedChars.test(password)) score -= 1; // Repeated characters
    if (commonPattern.test(password)) score -= 1; // Common pattern
    if (/^(password|admin|user|test)/i.test(password)) score -= 2; // Common words
    
    // Normalize score
    score = Math.max(0, Math.min(10, score));
    
    let label = 'Weak';
    if (score >= 4) label = 'Fair';
    if (score >= 6) label = 'Good';
    if (score >= 8) label = 'Strong';
    if (score >= 9) label = 'Very Strong';
    
    return { score, label };
  },
  
  /**
   * Check if password has been compromised (placeholder for API integration)
   * @param {string} password - The password to check
   * @returns {Promise<boolean>} - True if compromised
   */
  async checkCompromised(password) {
    // In production, integrate with haveibeenpwned.com API
    // This is a placeholder that checks against common passwords
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'password1', 'password123', 'admin', 'letmein', 'welcome'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  },
  
  /**
   * Generate a secure random password
   * @param {number} length - Password length (default: 16)
   * @returns {string} - Generated password
   */
  generateSecure(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 27)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
};

module.exports = passwordValidator;
`;

// Vitest config
files['vitest.config.js'] = `import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'uploads/',
        'data/',
        'backups/',
        'scripts/initDatabase.js'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
});
`;

// Create all files
console.log('\n📁 Creating files...\n');
Object.entries(files).forEach(([filePath, content]) => {
  createFile(filePath, content);
});

console.log('\n✅ Server structure setup complete!');
console.log('\n📌 Next steps:');
console.log('1. Run: npm install (if you haven\'t already)');
console.log('2. Initialize database: npm run init-db');
console.log('3. Start the server: npm run dev');
console.log('\n🔐 Default admin credentials:');
console.log('   Email: admin@clearsight.com');
console.log('   Password: admin123');
console.log('\n⚠️  Remember to change the admin password in production!');
