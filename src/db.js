import pg from 'pg';
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
export async function waitForSchema() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { await pool.query('SELECT id FROM jobs LIMIT 0'); return; }
    catch { await new Promise(resolve => setTimeout(resolve, 2000)); }
  }
  throw new Error('Jobs schema unavailable after 120 seconds');
}
