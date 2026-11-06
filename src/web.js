import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { pool } from './db.js';
const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    if (req.method === 'GET' && req.url === '/health') {
      await pool.query('SELECT id FROM jobs LIMIT 0');
      res.end(JSON.stringify({ status: 'ok' }));
    } else if (req.method === 'POST' && req.url === '/jobs') {
      const id = randomUUID();
      await pool.query('INSERT INTO jobs (id) VALUES ($1)', [id]);
      res.writeHead(202); res.end(JSON.stringify({ id, status: 'pending' }));
    } else if (req.method === 'GET' && /^\/jobs\/[0-9a-f-]{36}$/.test(req.url)) {
      const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.url.split('/')[2]]);
      res.writeHead(rows.length ? 200 : 404); res.end(JSON.stringify(rows[0] ?? { error: 'Not found' }));
    } else { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch { res.writeHead(503); res.end(JSON.stringify({ error: 'Database unavailable' })); }
});
server.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
process.on('SIGTERM', () => server.close(async () => { await pool.end(); process.exit(0); }));
