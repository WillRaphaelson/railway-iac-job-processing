import { pool } from './db.js';
try {
  await pool.query(`CREATE TABLE IF NOT EXISTS jobs (
    id uuid PRIMARY KEY, status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz
  )`);
  console.log('Jobs schema ready');
} finally { await pool.end(); }
