const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { describe, it, expect, beforeEach, afterEach } = require('vitest');
const mediaRoutes = require('../routes/media');
const database = require('../config/database');
const jwt = require('jsonwebtoken');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/media', mediaRoutes);
  return app;
};

describe('Media Routes', () => {
  let app;
  let testDb;
  let authToken;
  let testUploadDir;

  beforeEach(async () => {
    app = createTestApp();
    
    // Create test upload directory
    testUploadDir = path.join(__dirname, 'test-uploads');
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
      fs.mkdirSync(path.join(testUploadDir, 'images'), { recursive: true });
    }

    // Create in-memory test database
    const sqlite3 = require('sqlite3');
    testDb = new sqlite3.Database(':memory:');
    
    await new Promise((resolve) => {
      testDb.serialize(() => {
        testDb.run(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin'
          )
        `);
        
        testDb.run(`
          CREATE TABLE media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            media_type TEXT NOT NULL,
            category TEXT,
            alt_text TEXT,
            caption TEXT,
            uploaded_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, resolve);
      });
    });

    // Insert test user
    await new Promise((resolve) => {
      testDb.run(
        'INSERT INTO users (id, username, password, role) VALUES (1, "testuser", "hashedpass", "admin")',
        resolve
      );
    });

    database.getDb = () => testDb;

    // Create auth token
    authToken = jwt.sign(
      { id: 1, username: 'testuser', role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(() => {
    if (testDb) {
      testDb.close();
    }
    
    // Clean up test upload directory
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
  });

  describe('GET /media', () => {
    it('returns media library for authenticated users', async () => {
      // Insert test media
      await new Promise((resolve) => {
        testDb.run(`
          INSERT INTO media (
            filename, original_name, file_path, file_size, mime_type, 
            media_type, uploaded_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          'test.jpg', 'original.jpg', '/uploads/images/test.jpg', 
          1024, 'image/jpeg', 'image', 1
        ], resolve);
      });

      const response = await request(app)
        .get('/media')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.media).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .get('/media');

      expect(response.status).toBe(401);
    });

    it('filters by media type', async () => {
      const response = await request(app)
        .get('/media?type=image')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /media/upload', () => {
    it('uploads valid image file', async () => {
      // Create a test image buffer
      const testImageBuffer = Buffer.from('fake-image-data');
      
      const response = await request(app)
        .post('/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        })
        .field('category', 'test')
        .field('alt_text', 'Test image');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('File uploaded successfully');
      expect(response.body.media.filename).toBeDefined();
    });

    it('rejects invalid file types', async () => {
      const testBuffer = Buffer.from('fake-exe-data');
      
      const response = await request(app)
        .post('/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testBuffer, {
          filename: 'malicious.exe',
          contentType: 'application/x-executable'
        });

      expect(response.status).toBe(400);
    });

    it('requires authentication for upload', async () => {
      const response = await request(app)
        .post('/media/upload')
        .attach('file', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /media/:id', () => {
    it('deletes media file', async () => {
      // Insert test media
      await new Promise((resolve) => {
        testDb.run(`
          INSERT INTO media (
            id, filename, original_name, file_path, file_size, 
            mime_type, media_type, uploaded_by
          ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'test.jpg', 'original.jpg', '/uploads/images/test.jpg',
          1024, 'image/jpeg', 'image', 1
        ], resolve);
      });

      const response = await request(app)
        .delete('/media/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Media deleted successfully');
    });

    it('handles non-existent media', async () => {
      const response = await request(app)
        .delete('/media/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});