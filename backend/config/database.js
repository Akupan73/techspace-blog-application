const Database = require('better-sqlite3');
const path = require('path');

// Create or connect to the database
const dbPath = path.join(__dirname, '..', 'database.sqlite');

const db = new Database(dbPath);

// Enable foreign key support
db.pragma('foreign_keys = ON');

// Create Users Table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Create Blogs Table
db.exec(`
    CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        image TEXT,
        excerpt TEXT,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        status TEXT DEFAULT 'published',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );
`);

// Create indexes for faster searches
db.exec(`
    CREATE INDEX IF NOT EXISTS idx_blogs_author
    ON blogs(author_id);

    CREATE INDEX IF NOT EXISTS idx_blogs_status
    ON blogs(status);
`);

console.log('Database connected successfully!');
console.log('Users and Blogs tables are ready.');

module.exports = db;
