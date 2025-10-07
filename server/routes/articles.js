const express = require('express');
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
