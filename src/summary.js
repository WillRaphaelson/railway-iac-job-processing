import { pool, waitForSchema } from './db.js';
try {
  await waitForSchema();
  const { rows } = await pool.query("SELECT count(*)::int AS completed FROM jobs WHERE status = 'completed'");
  console.log(JSON.stringify({ event: 'daily-summary', ...rows[0] }));
} finally { await pool.end(); }
