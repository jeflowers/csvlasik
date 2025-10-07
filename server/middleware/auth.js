const jwt = require('jsonwebtoken');

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
