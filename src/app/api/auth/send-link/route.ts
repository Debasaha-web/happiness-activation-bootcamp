import { NextRequest, NextResponse } from "next/server";
import { signMagicToken } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || req.nextUrl.origin;

  const token = await signMagicToken(email, name);
  const link = `${appUrl}/auth/callback?token=${encodeURIComponent(token)}`;

  const isProd = process.env.NODE_ENV === "production";

  try {
    await sendMagicLink(email, link);
  } catch (err) {
    // In local dev without Resend keys, fall back to returning the link so
    // the flow is testable. In production, surface the failure.
    if (isProd) {
      console.error("sendMagicLink failed:", err);
      return NextResponse.json(
        { error: "Couldn't send the email. Try again in a moment." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, devLink: link });
  }

  return NextResponse.json({ ok: true });
}
