// End-to-end test of the Day-7 report pipeline against REAL Supabase + Anthropic.
// Seeds a throwaway user with sample answers, generates the review, prints it,
// then deletes the user (responses cascade). Mirrors src/lib/report.ts exactly.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const SYSTEM_PROMPT = `You are the voice of the Happiness Activation Bootcamp by The AEA Institute — "the offensive side of mental health."

You are writing a personal week-in-review for one adult who just finished a 7-day mental fitness bootcamp. Each day trained one mindset: Gratitude, Aspiration, Mission, Hope, Resilience, Perspective, Purpose.

VOICE: warm, direct, energetic. Talking to a capable adult. Never clinical, never saccharine.

YOUR OUTPUT — a week-in-review that: (1) names 2–3 themes in their OWN words, (2) reflects their strongest and most challenging mindset day, (3) quotes back 1–2 of their actual lines, (4) closes with a forward push. ~400–500 words, GitHub Markdown, no preamble.

HARD RULE: use ONLY what they wrote. Invent nothing.`;

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 1. seed a throwaway user
const email = `report-test+${Date.now()}@example.com`;
const { data: user } = await db.from("users").insert({ email, name: "Dana" }).select("id").single();
console.log(`\n🌱 seeded test user ${user.id}`);

const sample = [
  { day: 1, exercise: "neuro_tagging", format: "text", scenario_tied: true, value_text: "My old mentor Priya — she'd text 'you made me braver at work.'" },
  { day: 1, exercise: "neuro_journaling", format: "text", scenario_tied: false, value_text: "My kid laughed at dinner and I actually noticed it for once." },
  { day: 2, exercise: "neuro_tagging", format: "text", scenario_tied: true, value_text: "I want to start the coaching practice I keep talking about and never start." },
  { day: 4, exercise: "neuro_tagging", format: "text", scenario_tied: true, value_text: "The promotion fell through. I asked what's still possible and applied somewhere bolder." },
  { day: 5, exercise: "neuro_journaling", format: "text", scenario_tied: true, value_text: "Losing the contract. I've rebuilt before — I keep forgetting I'm the one who got us back up." },
  { day: 7, exercise: "neuro_tagging", format: "text", scenario_tied: true, value_text: "On purpose looks like being the steady one people can count on, at home and at work." },
];
await db.from("responses").insert(
  sample.map((s, i) => ({ user_id: user.id, day: s.day, block: i % 2 ? "pm" : "am", prompt_key: `test_${i}`, ...s }))
);
console.log(`   ✓ inserted ${sample.length} sample answers across days 1,2,4,5,7`);

// 2. build transcript + generate (mirrors lib/report.ts)
const { data: rows } = await db.from("responses").select("day, exercise, format, value_text, scenario_tied").eq("user_id", user.id).order("day");
const transcript = rows.map((r) => `• Day ${r.day} (${r.exercise})${r.scenario_tied ? " [scenario]" : ""}: ${r.value_text}`).join("\n");

console.log(`\n🤖 generating week-in-review with claude-sonnet-4-6 …\n`);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const msg = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1500,
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content: `Here is everything this person wrote. Write their week-in-review.\n${transcript}` }],
});
const report = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();

console.log("─".repeat(64));
console.log(report);
console.log("─".repeat(64));
console.log(`\n   tokens — in: ${msg.usage.input_tokens}, out: ${msg.usage.output_tokens}`);

// 3. clean up
await db.from("users").delete().eq("id", user.id);
console.log(`\n🧹 deleted test user. \n✅ Day-7 report pipeline works end to end.\n`);
