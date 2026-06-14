// Confirms the Anthropic key works with the model the Day-7 report uses.
// Usage: node scripts/verify-anthropic.mjs
import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const key = process.env.ANTHROPIC_API_KEY;
if (!key || !key.startsWith("sk-ant")) {
  console.error("\n❌ ANTHROPIC_API_KEY not set (or not an sk-ant… key) in .env.local\n");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: key });
console.log("\n🤖 Pinging claude-sonnet-4-6 …\n");

try {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16,
    messages: [{ role: "user", content: "Reply with exactly: OK" }],
  });
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  console.log(`   ✓ model responded: "${text}"`);
  console.log(`   ✓ tokens — in: ${msg.usage.input_tokens}, out: ${msg.usage.output_tokens}`);
  console.log(`\n✅ Anthropic is wired up. The Day-7 report will generate.\n`);
} catch (err) {
  console.error(`❌ Call failed: ${err?.status || ""} ${err?.message || err}\n`);
  process.exit(1);
}
