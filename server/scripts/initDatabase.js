const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'clearsight.db');
console.log('Initializing database at:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT DEFAULT "viewer", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)');

  // Articles table
  db.run('CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, category TEXT, tags TEXT, meta_description TEXT, author_id INTEGER, status TEXT DEFAULT "draft", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (author_id) REFERENCES users(id))');

  // Testimonials table
  db.run('CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, content TEXT NOT NULL, rating INTEGER, procedure_type TEXT, procedure_date DATE, approved BOOLEAN DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');

  // Media table
  db.run('CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, filepath TEXT NOT NULL, mimetype TEXT, size INTEGER, title TEXT, description TEXT, uploaded_by INTEGER, uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (uploaded_by) REFERENCES users(id))');

  // Audit logs table
  db.run('CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action TEXT NOT NULL, entity_type TEXT, entity_id INTEGER, details TEXT, ip_address TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))');

  // Translations cache table
  db.run('CREATE TABLE IF NOT EXISTS translation_cache (id INTEGER PRIMARY KEY AUTOINCREMENT, source_text TEXT NOT NULL, target_language TEXT NOT NULL, translated_text TEXT NOT NULL, source_language TEXT, service_used TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(source_text, target_language, source_language))');

  console.log('✓ Database tables created successfully');

  // Create default admin user
  const bcrypt = require('bcryptjs');
  const adminPassword = bcrypt.hashSync('admin123', 12);
  
  db.run(
    'INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['admin@clearsight.com', adminPassword, 'Admin User', 'admin'],
    (err) => {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log('✓ Default admin user created (admin@clearsight.com / admin123)');
      }
    }
  );
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✓ Database initialization complete');
  }
});
