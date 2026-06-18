import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import haiData from "@/content/hai-questions.json";

export const runtime = "nodejs";

function computeScores(answers: number[]) {
  const section1 = answers.slice(0, 10).reduce((a, b) => a + b, 0);
  const section2 = answers.slice(10, 20).reduce((a, b) => a + b, 0);
  const section3 = answers.slice(20, 25).reduce((a, b) => a + b, 0);
  const total = section1 + section2 + section3;

  const tier = haiData.tiers.find((t) => total >= t.min && total <= t.max);

  return {
    section1,
    section2,
    section3,
    total,
    tier: tier?.label ?? "Reactive",
  };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { answers: number[]; phase: "pre" | "post" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { answers, phase } = body;

  if (
    !Array.isArray(answers) ||
    answers.length !== 25 ||
    answers.some((a) => a < 1 || a > 5) ||
    (phase !== "pre" && phase !== "post")
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const scores = computeScores(answers);
  const db = supabaseAdmin();

  // Save the attempt
  const { data: attempt, error } = await db
    .from("hai_attempts")
    .insert({
      user_id: session.userId,
      phase,
      answers,
      ...scores,
    })
    .select()
    .single();

  if (error) {
    console.error("HAI save failed:", error);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }

  // For post-test, fetch the pre attempt to compute lift
  let pre = null;
  if (phase === "post") {
    const { data: preAttempt } = await db
      .from("hai_attempts")
      .select("*")
      .eq("user_id", session.userId)
      .eq("phase", "pre")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    pre = preAttempt;
  }

  return NextResponse.json({
    ok: true,
    attempt,
    pre,
    lift: pre ? scores.total - pre.total : null,
    tierChange: pre && pre.tier !== scores.tier ? { from: pre.tier, to: scores.tier } : null,
  });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const db = supabaseAdmin();

  // Return the user's latest pre and post attempts
  const { data: attempts } = await db
    .from("hai_attempts")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  const pre = attempts?.find((a) => a.phase === "pre") ?? null;
  const post = attempts?.find((a) => a.phase === "post") ?? null;

  return NextResponse.json({ pre, post });
}
