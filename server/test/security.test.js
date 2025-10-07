const request = require('supertest');
const express = require('express');
const { describe, it, expect, beforeEach } = require('vitest');
const { securityHeaders, rateLimits, validateRequest } = require('../middleware/security');

const createTestApp = () => {
  const app = express();
  app.use(securityHeaders);
  app.use(validateRequest);
  app.use('/api', rateLimits.api);
  
  app.get('/test', (req, res) => {
    res.json({ message: 'success' });
  });
  
  app.post('/test', express.json(), (req, res) => {
    res.json({ message: 'success', body: req.body });
  });
  
  return app;
};

describe('Security Middleware', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Security Headers', () => {
    it('sets proper security headers', async () => {
      const response = await request(app)
        .get('/test');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('0');
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('sets HSTS header', async () => {
      const response = await request(app)
        .get('/test');

      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
    });
  });

  describe('Request Validation', () => {
    it('blocks suspicious script injection attempts', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          malicious: '<script>alert("xss")</script>'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request');
    });

    it('blocks SQL injection attempts', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          query: "'; DROP TABLE users; --"
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request');
    });

    it('blocks path traversal attempts', async () => {
      const response = await request(app)
        .get('/test?file=../../../etc/passwd');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request');
    });

    it('allows legitimate requests', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'I would like to schedule a consultation.'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('success');
    });
  });

  describe('Rate Limiting', () => {
    it('allows requests within limit', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/test');
        expect(response.status).toBe(200);
      }
    });

    it('blocks requests exceeding limit', async () => {
      // Make requests up to the limit
      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/test');
      }

      // This request should be rate limited
      const response = await request(app)
        .get('/api/test');

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many requests');
    });
  });
});