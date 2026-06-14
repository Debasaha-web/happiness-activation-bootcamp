import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ── Magic-link + session auth (no passwords) ──
// Two JWTs, both signed with AUTH_SECRET:
//   • magic  — short-lived (15 min), emailed as a link, carries email+name
//   • session — long-lived (30 days), httpOnly cookie, carries userId+email

export const SESSION_COOKIE = "ha_session";
const MAGIC_TTL = "15m";
const SESSION_TTL = "30d";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("Missing AUTH_SECRET env var.");
  return new TextEncoder().encode(s);
}

export type MagicClaims = { email: string; name?: string; kind: "magic" };
export type SessionClaims = { userId: string; email: string; kind: "session" };

export async function signMagicToken(email: string, name?: string) {
  return new SignJWT({ email, name, kind: "magic" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MAGIC_TTL)
    .sign(secret());
}

export async function verifyMagicToken(token: string): Promise<MagicClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== "magic" || typeof payload.email !== "string") return null;
    return {
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : undefined,
      kind: "magic",
    };
  } catch {
    return null;
  }
}

export async function signSessionToken(userId: string, email: string) {
  return new SignJWT({ userId, email, kind: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      payload.kind !== "session" ||
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string"
    )
      return null;
    return { userId: payload.userId, email: payload.email, kind: "session" };
  } catch {
    return null;
  }
}

/** Read the current session from the cookie store (server components / routes). */
export async function getSession(): Promise<SessionClaims | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
