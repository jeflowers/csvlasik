import { beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Test database path
const testDbPath = path.join(__dirname, '..', 'data', 'test.db');

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = testDbPath;
  
  // Create test fixtures directory
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
  
  console.log('Test environment setup complete');
});

afterAll(() => {
  // Clean up test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  
  console.log('Test cleanup complete');
});
