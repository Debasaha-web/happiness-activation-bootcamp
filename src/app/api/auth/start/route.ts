import { NextRequest, NextResponse } from "next/server";
import {
  signSessionToken,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
} from "@/lib/auth";
import { ensureUser, getProgress } from "@/lib/progress";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Frictionless sign-in: name + email becomes the account and signs them in
// instantly (no email verification step). Returning users resume by email.
export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 }
    );
  }
  if (name.length < 1) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }

  try {
    const userId = await ensureUser(email, name);
    const progress = await getProgress(userId);

    const isNew = Object.keys(progress.days).length === 0;
    const dest = progress.completedAt
      ? "/report"
      : isNew
        ? "/day/1/am"
        : "/me";

    const token = await signSessionToken(userId, email);
    const res = NextResponse.json({ ok: true, redirect: dest });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTS);
    return res;
  } catch (err) {
    console.error("auth/start failed:", err);
    return NextResponse.json(
      { error: "Couldn't start your session. Try again." },
      { status: 500 }
    );
  }
}
