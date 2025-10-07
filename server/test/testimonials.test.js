const request = require('supertest');
const express = require('express');
const { describe, it, expect, beforeEach, afterEach } = require('vitest');
const testimonialsRoutes = require('../routes/testimonials');
const database = require('../config/database');
const jwt = require('jsonwebtoken');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/testimonials', testimonialsRoutes);
  return app;
};

describe('Testimonials Routes', () => {
  let app;
  let testDb;
  let authToken;

  beforeEach(async () => {
    app = createTestApp();
    
    // Create in-memory test database
    const sqlite3 = require('sqlite3');
    testDb = new sqlite3.Database(':memory:');
    
    // Create test tables
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
          CREATE TABLE testimonials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT NOT NULL,
            patient_initials TEXT,
            age INTEGER,
            occupation TEXT,
            location TEXT NOT NULL,
            procedure_type TEXT NOT NULL,
            vision_before TEXT NOT NULL,
            vision_after TEXT NOT NULL,
            testimonial_text TEXT NOT NULL,
            rating INTEGER DEFAULT 5,
            status TEXT DEFAULT 'pending',
            is_featured BOOLEAN DEFAULT 0,
            privacy_level TEXT DEFAULT 'initials',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, resolve);
      });
    });

    // Insert test user and testimonial
    await new Promise((resolve) => {
      testDb.run(
        'INSERT INTO users (id, username, password, role) VALUES (1, "testuser", "hashedpass", "admin")',
        () => {
          testDb.run(`
            INSERT INTO testimonials (
              patient_name, location, procedure_type, vision_before, vision_after, 
              testimonial_text, rating, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            'John Doe', 'Los Angeles, CA', 'LASIK', '20/400', '20/20',
            'Amazing results!', 5, 'approved'
          ], resolve);
        }
      );
    });

    // Mock database
    database.getDb = () => testDb;

    // Create auth token
    authToken = jwt.sign(
      { userId: 1, username: 'testuser', role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(() => {
    if (testDb) {
      testDb.close();
    }
  });

  describe('GET /testimonials/public', () => {
    it('returns approved testimonials', async () => {
      const response = await request(app)
        .get('/testimonials/public');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].display_name).toBe('J.D.'); // Privacy level 'initials'
      expect(response.body[0].procedure_type).toBe('LASIK');
    });

    it('filters by procedure type', async () => {
      const response = await request(app)
        .get('/testimonials/public?procedure=LASIK');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('respects privacy levels', async () => {
      // Add testimonial with full name privacy
      await new Promise((resolve) => {
        testDb.run(`
          INSERT INTO testimonials (
            patient_name, location, procedure_type, vision_before, vision_after,
            testimonial_text, rating, status, privacy_level
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'Jane Smith', 'San Diego, CA', 'PRK', '20/200', '20/20',
          'Great experience!', 5, 'approved', 'full_name'
        ], resolve);
      });

      const response = await request(app)
        .get('/testimonials/public');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      
      const fullNameTestimonial = response.body.find(t => t.display_name === 'Jane Smith');
      expect(fullNameTestimonial).toBeDefined();
    });
  });

  describe('POST /testimonials', () => {
    it('creates testimonial with valid data', async () => {
      const testimonialData = {
        patient_name: 'Test Patient',
        location: 'Test City, CA',
        procedure_type: 'LASIK',
        vision_before: '20/300',
        vision_after: '20/20',
        testimonial_text: 'Excellent results!',
        rating: 5
      };

      const response = await request(app)
        .post('/testimonials')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testimonialData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Testimonial created successfully');
      expect(response.body.id).toBeDefined();
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/testimonials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patient_name: 'Test Patient'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('validates procedure type', async () => {
      const response = await request(app)
        .post('/testimonials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patient_name: 'Test Patient',
          location: 'Test City',
          procedure_type: 'INVALID',
          vision_before: '20/300',
          vision_after: '20/20',
          testimonial_text: 'Test',
          rating: 5
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.msg === 'Invalid procedure type')).toBe(true);
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post('/testimonials')
        .send({
          patient_name: 'Test Patient',
          location: 'Test City',
          procedure_type: 'LASIK',
          vision_before: '20/300',
          vision_after: '20/20',
          testimonial_text: 'Test',
          rating: 5
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /testimonials/:id/status', () => {
    it('updates testimonial status', async () => {
      const response = await request(app)
        .patch('/testimonials/1/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Status updated successfully');
    });

    it('validates status values', async () => {
      const response = await request(app)
        .patch('/testimonials/1/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
    });

    it('handles non-existent testimonial', async () => {
      const response = await request(app)
        .patch('/testimonials/999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(404);
    });
  });
});