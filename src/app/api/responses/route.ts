import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveAnswers, completeBlock } from "@/lib/progress";
import { generateReport } from "@/lib/report";
import { sendReportEmail } from "@/lib/email";
import { markdownToHtml } from "@/lib/report";
import { supabaseAdmin } from "@/lib/supabase";
import type { SaveRequest } from "@/lib/types";
import { TOTAL_DAYS } from "@/content/days";

export const runtime = "nodejs";
export const maxDuration = 60; // allow time for the Day-7 report generation

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: SaveRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { day, block, answers, complete } = body;
  if (
    !Number.isInteger(day) ||
    day < 1 ||
    day > TOTAL_DAYS ||
    (block !== "am" && block !== "pm") ||
    !Array.isArray(answers)
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await saveAnswers(session.userId, day, block, answers);

    if (!complete) {
      return NextResponse.json({ ok: true, saved: answers.length });
    }

    const { advancedTo, weekComplete } = await completeBlock(
      session.userId,
      day,
      block
    );

    // Day 7 PM finished → generate + deliver the week-in-review.
    let reportReady = false;
    if (weekComplete && block === "pm" && day === TOTAL_DAYS) {
      try {
        const md = await generateReport(session.userId);
        const db = supabaseAdmin();
        await db
          .from("reports")
          .upsert(
            { user_id: session.userId, summary_md: md, delivered: false },
            { onConflict: "user_id" }
          );

        try {
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
            req.nextUrl.origin;
          await sendReportEmail(session.email, markdownToHtml(md), appUrl);
          await db
            .from("reports")
            .update({ delivered: true })
            .eq("user_id", session.userId);
        } catch (mailErr) {
          console.error("report email failed:", mailErr);
        }
        reportReady = true;
      } catch (repErr) {
        console.error("report generation failed:", repErr);
      }
    }

    return NextResponse.json({
      ok: true,
      saved: answers.length,
      advancedTo,
      weekComplete,
      reportReady,
    });
  } catch (err) {
    console.error("responses POST failed:", err);
    return NextResponse.json({ error: "Couldn't save." }, { status: 500 });
  }
}
