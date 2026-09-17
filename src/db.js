import pkg from 'node-sqlite3-wasm';
const { Database } = pkg;
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// DB lives in /data so it persists outside the source tree.
// Override with DB_PATH env var on hosts with a mounted disk.
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'data', 'virative.db');
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    company     TEXT,
    message     TEXT    NOT NULL,
    ip          TEXT,
    user_agent  TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

export function insertSubmission(data) {
  const result = db.run(
    `INSERT INTO submissions (name, email, company, message, ip, user_agent)
     VALUES (:name, :email, :company, :message, :ip, :user_agent)`,
    {
      ':name': data.name,
      ':email': data.email,
      ':company': data.company || null,
      ':message': data.message,
      ':ip': data.ip || null,
      ':user_agent': data.user_agent || null,
    }
  );
  return result.lastInsertRowid;
}

// Kept ready for a future admin view (not exposed yet).
export function listSubmissions(limit = 100) {
  return db.all('SELECT * FROM submissions ORDER BY created_at DESC LIMIT :limit', {
    ':limit': limit,
  });
}

function close() {
  try { db.close(); } catch { /* already closed */ }
}
process.on('SIGINT', () => { close(); process.exit(0); });
process.on('SIGTERM', () => { close(); process.exit(0); });

export default db;
