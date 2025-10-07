const express = require('express');
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
