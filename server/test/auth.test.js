const request = require('supertest');
const express = require('express');
const { describe, it, expect, beforeEach, afterEach } = require('vitest');
const authRoutes = require('../routes/auth');
const database = require('../config/database');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  return app;
};

describe('Auth Routes', () => {
  let app;
  let testDb;

  beforeEach(async () => {
    app = createTestApp();
    
    // Create in-memory test database
    const sqlite3 = require('sqlite3');
    testDb = new sqlite3.Database(':memory:');
    
    // Create test tables
    await new Promise((resolve) => {
      testDb.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, resolve);
    });

    // Insert test user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('testpass123', 12);
    
    await new Promise((resolve) => {
      testDb.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['testuser', hashedPassword, 'admin'],
        resolve
      );
    });

    // Mock database module
    database.getDb = () => testDb;
  });

  afterEach(() => {
    if (testDb) {
      testDb.close();
    }
  });

  describe('POST /auth/login', () => {
    it('successfully authenticates valid user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
    });

    it('rejects invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('rejects missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('implements rate limiting', async () => {
      // Make multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/auth/login')
          .send({
            username: 'testuser',
            password: 'wrongpassword'
          });
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many failed attempts');
    });

    it('validates input length', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'a'.repeat(100), // Too long
          password: 'test'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid credentials format');
    });
  });

  describe('GET /auth/verify', () => {
    it('verifies valid JWT token', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      const token = loginResponse.body.token;

      // Verify token
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('testuser');
    });

    it('rejects invalid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('rejects missing token', async () => {
      const response = await request(app)
        .get('/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });
  });
});