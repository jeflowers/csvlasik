const express = require('express');
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
