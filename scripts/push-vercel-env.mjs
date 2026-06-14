// Pushes env vars from .env.local into the linked Vercel project.
// Usage: node scripts/push-vercel-env.mjs
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SCOPE = ["--scope", "aea-institute-team"];

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}

// var -> which Vercel environments to set it in
const PLAN = {
  NEXT_PUBLIC_SUPABASE_URL: ["production", "preview", "development"],
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ["production", "preview", "development"],
  SUPABASE_SERVICE_ROLE_KEY: ["production", "preview", "development"],
  AUTH_SECRET: ["production", "preview", "development"],
  EMAIL_FROM: ["production", "preview", "development"],
  // App URL is production-only; preview/dev fall back to the request origin.
  NEXT_PUBLIC_APP_URL: ["production"],
};

// Production app URL override (don't use localhost from .env.local).
const OVERRIDE = {
  NEXT_PUBLIC_APP_URL: "https://activate-happiness.vercel.app",
};

for (const [name, envs] of Object.entries(PLAN)) {
  const value = OVERRIDE[name] ?? env[name];
  if (!value) {
    console.log(`  – skip ${name} (no value)`);
    continue;
  }
  for (const e of envs) {
    try {
      execFileSync("vercel", ["env", "add", name, e, ...SCOPE], {
        input: value,
        stdio: ["pipe", "ignore", "pipe"],
      });
      console.log(`  ✓ ${name} (${e})`);
    } catch (err) {
      const msg = (err.stderr?.toString() || err.message || "").trim();
      console.log(`  ✗ ${name} (${e}) — ${msg.split("\n").pop()}`);
    }
  }
}
console.log("done.");
