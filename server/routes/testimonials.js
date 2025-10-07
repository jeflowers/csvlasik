const express = require('express');
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
