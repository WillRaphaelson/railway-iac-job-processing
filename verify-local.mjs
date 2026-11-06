import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import pg from 'pg';
const env = { ...process.env, DATABASE_URL: 'postgresql://willraphaelson@127.0.0.1:55439/postgres', PORT: '3347' };
const children = [];
const run = file => execFileSync(process.execPath, [file], { env, encoding: 'utf8', timeout: 15000 });
const start = file => { const child = spawn(process.execPath, [file], { env, stdio: ['ignore', 'pipe', 'pipe'] }); children.push(child); return child; };
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
try {
  console.log(run('src/migrate.js').trim());
  console.log(run('src/migrate.js').trim());
  await pool.query('TRUNCATE jobs');
  start('src/web.js'); start('src/worker.js'); start('src/worker.js');
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch('http://127.0.0.1:3347/health')).ok) break; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  assert.equal((await fetch('http://127.0.0.1:3347/health')).status, 200);
  const ids = await Promise.all(Array.from({length: 10}, async () => {
    const response = await fetch('http://127.0.0.1:3347/jobs', { method: 'POST' });
    assert.equal(response.status, 202); return (await response.json()).id;
  }));
  let complete = 0;
  for (let i = 0; i < 150; i++) {
    complete = (await pool.query("SELECT count(*)::int AS n FROM jobs WHERE status = 'completed'")).rows[0].n;
    if (complete === 10) break;
    await new Promise(r => setTimeout(r, 100));
  }
  assert.equal(complete, 10); assert.equal(new Set(ids).size, 10);
  const job = await (await fetch(`http://127.0.0.1:3347/jobs/${ids[0]}`)).json();
  assert.equal(job.status, 'completed');
  assert.equal((await fetch('http://127.0.0.1:3347/missing')).status, 404);
  const summary = JSON.parse(run('src/summary.js'));
  assert.equal(summary.completed, 10);
  console.log(JSON.stringify({result:'PASS',submitted:10,completed:complete,workers:2,summary,repeatMigration:true,summaryExited:true}));
} finally {
  for (const child of children) child.kill('SIGTERM');
  await Promise.all(children.map(child => new Promise(resolve => { child.once('exit', resolve); if(child.exitCode !== null) resolve(); })));
  await pool.end();
}
