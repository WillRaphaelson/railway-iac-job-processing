import { pool, waitForSchema } from './db.js';
let stopping = false;
process.on('SIGTERM', () => { stopping = true; });
try {
  await waitForSchema();
  while (!stopping) {
    // One atomic statement claims and completes this demonstration's no-op job.
    const { rows } = await pool.query(`WITH next_job AS (
      SELECT id FROM jobs WHERE status = 'pending' ORDER BY created_at
      FOR UPDATE SKIP LOCKED LIMIT 1
    ) UPDATE jobs SET status = 'completed', completed_at = now()
      FROM next_job WHERE jobs.id = next_job.id RETURNING jobs.id`);
    if (rows.length) console.log(JSON.stringify({ completed: rows[0].id }));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
} finally { await pool.end(); }
