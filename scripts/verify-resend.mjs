// Sends one real test email through Resend to confirm the key + sender work.
// Usage: node scripts/verify-resend.mjs you@email.com
import { readFileSync } from "node:fs";
import { Resend } from "resend";

try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const to = process.argv[2];
const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Happiness Activation <onboarding@resend.dev>";

if (!key) {
  console.error("\n❌ RESEND_API_KEY not set in .env.local\n");
  process.exit(1);
}
if (!to) {
  console.error("\n❌ Pass a recipient: node scripts/verify-resend.mjs you@email.com\n");
  process.exit(1);
}

const resend = new Resend(key);
console.log(`\n📧 Sending test email\n   from: ${from}\n   to:   ${to}\n`);

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "Happiness Activation — Resend test ✓",
  html: `<div style="font-family:sans-serif"><h2>It works.</h2><p>Resend is wired up for the Happiness Activation Bootcamp.</p></div>`,
});

if (error) {
  console.error(`❌ Send failed: ${JSON.stringify(error)}\n`);
  console.error("   Common cause: sending FROM a domain you haven't verified, or");
  console.error("   sending TO an address other than your Resend signup email while on onboarding@resend.dev.\n");
  process.exit(1);
}

console.log(`✅ Sent. Resend id: ${data?.id}\n   Check the ${to} inbox.\n`);
