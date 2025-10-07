const express = require('express');
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
