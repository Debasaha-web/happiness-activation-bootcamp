import { supabaseAdmin } from "./supabase";
import type { AnswerPayload, Block } from "./types";
import { TOTAL_DAYS } from "@/content/days";

/** Create the user + enrollment if they don't exist. Returns the user id. */
export async function ensureUser(email: string, name?: string): Promise<string> {
  const db = supabaseAdmin();

  const { data: existing } = await db
    .from("users")
    .select("id, name")
    .eq("email", email)
    .maybeSingle();

  let userId: string;
  if (existing) {
    userId = existing.id as string;
    if (name && !existing.name) {
      await db.from("users").update({ name }).eq("id", userId);
    }
  } else {
    const { data, error } = await db
      .from("users")
      .insert({ email, name: name ?? null })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create user");
    userId = data.id as string;
  }

  // Ensure an enrollment exists (solo self-paced — no cohort).
  const { data: enr } = await db
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!enr) {
    await db.from("enrollments").insert({ user_id: userId, current_day: 1 });
  }

  return userId;
}

export type Progress = {
  currentDay: number;
  completedAt: string | null;
  days: Record<number, { amComplete: boolean; pmComplete: boolean }>;
};

export async function getProgress(userId: string): Promise<Progress> {
  const db = supabaseAdmin();

  const { data: enr } = await db
    .from("enrollments")
    .select("current_day, completed_at")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: dp } = await db
    .from("day_progress")
    .select("day, am_complete, pm_complete")
    .eq("user_id", userId);

  const days: Progress["days"] = {};
  for (const row of dp ?? []) {
    days[row.day as number] = {
      amComplete: !!row.am_complete,
      pmComplete: !!row.pm_complete,
    };
  }

  return {
    currentDay: (enr?.current_day as number) ?? 1,
    completedAt: (enr?.completed_at as string | null) ?? null,
    days,
  };
}

/** Upsert a batch of answers for one block. Re-answering overwrites in place. */
export async function saveAnswers(
  userId: string,
  day: number,
  block: Block,
  answers: AnswerPayload[]
): Promise<void> {
  if (answers.length === 0) return;
  const db = supabaseAdmin();

  const rows = answers.map((a) => ({
    user_id: userId,
    day,
    block,
    exercise: a.exercise,
    prompt_key: a.promptKey,
    format: a.format,
    value_text: a.valueText ?? null,
    value_bool: a.valueBool ?? null,
    value_choice: a.valueChoice ?? null,
    scenario_tied: a.scenarioTied,
  }));

  const { error } = await db
    .from("responses")
    .upsert(rows, { onConflict: "user_id,day,prompt_key" });
  if (error) throw new Error(`Failed to save answers: ${error.message}`);
}

/** Mark a block complete; advance the enrollment day when PM finishes. */
export async function completeBlock(
  userId: string,
  day: number,
  block: Block
): Promise<{ advancedTo: number; weekComplete: boolean }> {
  const db = supabaseAdmin();
  const now = new Date().toISOString();

  const patch =
    block === "am"
      ? { am_complete: true, am_completed_at: now }
      : { pm_complete: true, pm_completed_at: now };

  const { error } = await db
    .from("day_progress")
    .upsert(
      { user_id: userId, day, ...patch },
      { onConflict: "user_id,day" }
    );
  if (error) throw new Error(`Failed to mark complete: ${error.message}`);

  let advancedTo = day;
  let weekComplete = false;

  if (block === "pm") {
    if (day >= TOTAL_DAYS) {
      weekComplete = true;
      await db
        .from("enrollments")
        .update({ completed_at: now })
        .eq("user_id", userId);
    } else {
      advancedTo = day + 1;
      // Only move forward, never backward.
      const { data: enr } = await db
        .from("enrollments")
        .select("current_day")
        .eq("user_id", userId)
        .maybeSingle();
      const cur = (enr?.current_day as number) ?? 1;
      if (advancedTo > cur) {
        await db
          .from("enrollments")
          .update({ current_day: advancedTo })
          .eq("user_id", userId);
      }
    }
  }

  return { advancedTo, weekComplete };
}
