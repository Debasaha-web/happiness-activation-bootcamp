// Verifies the Supabase wiring end to end:
//   1. env vars present
//   2. service-role client can reach the project
//   3. all 6 tables exist (schema.sql ran)
//   4. a real write + read + cleanup round-trips
//
// Run:  node scripts/verify-supabase.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Load .env.local without extra deps.
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* ignore — rely on real env */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const fail = (msg) => {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
};

if (!url || url.includes("YOUR-PROJECT")) fail("NEXT_PUBLIC_SUPABASE_URL is not set in .env.local");
if (!key || key.startsWith("placeholder")) fail("SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");

const db = createClient(url, key, { auth: { persistSession: false } });

const TABLES = ["users", "cohorts", "enrollments", "day_progress", "responses", "reports"];

console.log(`\n🔌 Connecting to ${url} …\n`);

for (const t of TABLES) {
  const { error } = await db.from(t).select("*", { count: "exact", head: true });
  if (error) fail(`Table "${t}" not reachable: ${error.message}\n   → Did you run supabase/schema.sql in the SQL editor?`);
  console.log(`   ✓ table "${t}" exists`);
}

// Round-trip write/read/delete on users.
const email = `verify+${Date.now()}@example.com`;
const { data: ins, error: insErr } = await db
  .from("users")
  .insert({ email, name: "Verify Bot" })
  .select("id")
  .single();
if (insErr) fail(`Write failed: ${insErr.message}`);
console.log(`\n   ✓ inserted test user ${ins.id}`);

const { error: delErr } = await db.from("users").delete().eq("id", ins.id);
if (delErr) fail(`Cleanup delete failed: ${delErr.message}`);
console.log(`   ✓ cleaned up test user`);

console.log(`\n✅ Supabase is wired up correctly. All ${TABLES.length} tables live, read/write working.\n`);
