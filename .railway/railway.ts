import { defineRailway, github, postgres, project, service } from "railway/iac";

export default defineRailway(() => {
  const db = postgres("postgres");
  const source = github("WillRaphaelson/railway-iac-job-processing");
  const env = { NODE_ENV: "production", DATABASE_URL: db.env.DATABASE_URL };

  const web = service("web", {
    source,
    start: "npm run web",
    preDeploy: "npm run migrate",
    healthcheck: "/health",
    env,
  });
  const worker = service("worker", {
    source,
    start: "npm run worker",
    env,
  });
  const summary = service("summary", {
    source,
    start: "npm run summary",
    deploy: { cronSchedule: "0 2 * * *", restartPolicyType: "NEVER" },
    env,
  });

  return project("iac-job-processing", { resources: [db, web, worker, summary] });
});
