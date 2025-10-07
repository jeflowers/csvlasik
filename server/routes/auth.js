const express = require('express');
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
