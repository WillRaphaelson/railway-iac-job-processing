# Railway IaC job processing example

A minimal web API, PostgreSQL database, worker, and daily summary service defined in `.railway/railway.ts`.

Requires Node.js 22 or newer and a current Railway CLI. Run `npm install`, `npm run check`, create and link a dedicated Railway project, review `railway config plan`, and run `railway config apply`. The services build from this repository. Generate a public domain only for `web`.

`POST /jobs` creates an empty demonstration job; `GET /jobs/ID` returns its state. The worker marks jobs complete atomically. This is a no-op queue demonstration, not a general-purpose durable job execution system. Real workloads need idempotency, retries, and recovery of interrupted work.

`summary` is a regular service with `deploy.cronSchedule` set to `0 2 * * *` (02:00 UTC daily) and restart policy `NEVER`. It logs completed job count and closes its database pool. The cron IaC field requires deployment verification before the guide is publication-ready.

The public example API is unauthenticated and is intended only for demonstration. Add authentication and rate limiting before production use. PostgreSQL is referenced through its private `DATABASE_URL`.
