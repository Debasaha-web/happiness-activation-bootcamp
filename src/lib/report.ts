import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "./supabase";
import { DAYS } from "@/content/days";

// The Day-7 week-in-review. Voice + rules straight from the build brief §7.
const SYSTEM_PROMPT = `You are the voice of the Happiness Activation Bootcamp by The AEA Institute — "the offensive side of mental health."

You are writing a personal week-in-review for one adult who just finished a 7-day mental fitness bootcamp. Each day trained one mindset: Gratitude, Aspiration, Mission, Hope, Resilience, Perspective, Purpose. Each day they read a dramatic scenario, typed visualization "neuro-tagging" answers, listed gratitudes, journaled, and did a 45-second free-write "burst."

VOICE: warm, direct, energetic. You are talking to a capable adult. Never clinical, never saccharine, never a therapist. Think a great coach who actually read everything they wrote.

YOUR OUTPUT — a week-in-review that:
1. Names 2–3 themes the person surfaced in their OWN words across the week.
2. Reflects back their strongest mindset day and the one that challenged them most.
3. Quotes back 1–2 of their actual lines as evidence (use quotation marks; quote them verbatim).
4. Closes with a forward push — what to keep doing now that these 7 days set a new baseline.

HARD RULES:
- Use ONLY what the person actually wrote below. Invent NOTHING — no details, names, or events they didn't supply.
- If they wrote little on a day, that's fine — work with what's there; don't fabricate.
- ~400–500 words. Output GitHub-flavored Markdown. No preamble like "Here is your review" — just write it.
- Address them as "you." Do not use their name unless it appears in their answers.`;

type Row = {
  day: number;
  block: string;
  exercise: string;
  prompt_key: string;
  format: string;
  value_text: string | null;
  value_bool: boolean | null;
  value_choice: string | null;
  scenario_tied: boolean;
};

function formatAnswers(rows: Row[]): string {
  const byDay = new Map<number, Row[]>();
  for (const r of rows) {
    if (!byDay.has(r.day)) byDay.set(r.day, []);
    byDay.get(r.day)!.push(r);
  }

  const parts: string[] = [];
  for (const day of DAYS) {
    const dayRows = byDay.get(day.day) ?? [];
    if (dayRows.length === 0) continue;

    parts.push(`\n=== DAY ${day.day} — ${day.mindset.toUpperCase()} ===`);
    for (const r of dayRows) {
      let val = "";
      if (r.value_text != null && r.value_text.trim() !== "") val = r.value_text.trim();
      else if (r.value_choice != null) val = r.value_choice;
      else if (r.value_bool != null) val = r.value_bool ? "True" : "False";
      if (!val) continue;
      const tag = r.scenario_tied ? " [scenario]" : "";
      parts.push(`• (${r.exercise}/${r.format})${tag} ${val}`);
    }
  }
  return parts.join("\n");
}

/** Generate (or regenerate) the week-in-review for a user. Returns markdown. */
export async function generateReport(userId: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Missing ANTHROPIC_API_KEY env var.");

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("responses")
    .select(
      "day, block, exercise, prompt_key, format, value_text, value_bool, value_choice, scenario_tied"
    )
    .eq("user_id", userId)
    .order("day", { ascending: true });

  if (error) throw new Error(`Failed to load responses: ${error.message}`);

  const rows = (data ?? []) as Row[];
  const transcript = formatAnswers(rows);

  const anthropic = new Anthropic({ apiKey: key });
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is everything this person wrote across their 7 days. Write their week-in-review.\n${transcript}`,
      },
    ],
  });

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  return text || "_We couldn't generate your review this time — please try again._";
}

/** Minimal, safe Markdown → HTML for the email + report page. */
export function markdownToHtml(md: string): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>");

  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      closeList();
      continue;
    }
    if (/^###\s+/.test(line)) {
      closeList();
      out.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`);
    } else if (/^##\s+/.test(line)) {
      closeList();
      out.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`);
    } else if (/^#\s+/.test(line)) {
      closeList();
      out.push(`<h2>${inline(line.replace(/^#\s+/, ""))}</h2>`);
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}
