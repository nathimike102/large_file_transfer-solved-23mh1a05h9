import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from './utils/logger';

const dbPath = process.env.DATABASE_PATH || 'data/uploads.db';

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export const initDb = () => {
  logger.info('Initializing database schema...');

  // Uploads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      chunk_size INTEGER NOT NULL,
      total_chunks INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL,
      completed_at TEXT
    )
  `);

  // Chunks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chunks (
      upload_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      size INTEGER NOT NULL,
      etag TEXT,
      PRIMARY KEY (upload_id, chunk_index),
      FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE
    )
  `);

  logger.info('Database schema initialized successfully.');
};

export default db;
