import { NextRequest, NextResponse } from "next/server";
import {
  verifyMagicToken,
  signSessionToken,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
} from "@/lib/auth";
import { ensureUser, getProgress } from "@/lib/progress";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${base}/?error=missing-token`);
  }

  const claims = await verifyMagicToken(token);
  if (!claims) {
    return NextResponse.redirect(`${base}/?error=expired`);
  }

  let userId: string;
  let currentDay = 1;
  try {
    userId = await ensureUser(claims.email, claims.name);
    const progress = await getProgress(userId);
    currentDay = progress.completedAt ? 7 : progress.currentDay;
  } catch (err) {
    console.error("callback ensureUser failed:", err);
    return NextResponse.redirect(`${base}/?error=server`);
  }

  const session = await signSessionToken(userId, claims.email);
  const dest = `${base}/day/${currentDay}/am`;

  const res = NextResponse.redirect(dest);
  res.cookies.set(SESSION_COOKIE, session, SESSION_COOKIE_OPTS);
  return res;
}
