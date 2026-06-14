# Happiness Activation Bootcamp

A 7-day mental fitness bootcamp for adults (ABM 3.0). Twenty minutes a day — one
trainable mindset per day, a Morning (AM) and Evening (PM) block each. Built for
The AEA Institute.

**Order:** Gratitude → Aspiration → Mission → Hope → Resilience → Perspective → Purpose.

---

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Supabase** (Postgres) — data only; all writes go through the server
- **Resend** — magic-link auth email + Day-7 report delivery
- **Anthropic** (`claude-sonnet-4-6`) — the Day-7 week-in-review
- **Vercel** — hosting (auto-deploy from GitHub)

All content lives in [`src/content/days.ts`](src/content/days.ts) — edit copy there
without touching components.

---

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in real values (see below)
npm run dev                  # http://localhost:3000
```

Without real keys, the app still runs: the magic-link screen returns a clickable
**dev link** in the browser instead of emailing it, so you can walk the flow. (DB
writes and the Day-7 report need real Supabase/Anthropic keys.)

---

## Environment variables

See [`.env.example`](.env.example). Set the same keys locally **and** in
Vercel → Settings → Environment Variables.

| Var | Where to get it |
|-----|-----------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally; `https://activate-happiness.vercel.app` in prod |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `AUTH_SECRET` | `openssl rand -base64 48` |
| `RESEND_API_KEY` / `EMAIL_FROM` | resend.com → API Keys (verify your sending domain) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |

---

## Supabase

1. Create a **new, isolated** Supabase project (do not reuse any existing one).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy the URL + anon + service-role keys into your env vars.

RLS is on for every table with **no public policies** — the anon client can't read
or write. The server uses the service-role key (which bypasses RLS) only after it
verifies the magic-link session JWT itself.

---

## Auth (magic link, no passwords)

1. `/` collects name + email → `POST /api/auth/send-link`.
2. We sign a 15-minute magic JWT and email a link via Resend.
3. `/auth/callback` verifies it, upserts the user + enrollment, sets a 30-day
   httpOnly session cookie, and lands them on their current day.

`AUTH_SECRET` signs both the magic token and the session.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel. **Name the project so the URL contains `happiness` and
   `activate`** — e.g. `activate-happiness` → `activate-happiness.vercel.app`.
3. Add all env vars (Production + Preview). Set `NEXT_PUBLIC_APP_URL` to the prod URL.
4. Deploy.

### Front door
People enter EITHER via a **Kajabi button** (point it at the Vercel URL) OR a direct
link you send. Day URLs follow `/day/[n]/am` and `/day/[n]/pm`.

---

## The 7 hype videos

Each day's video is referenced in `src/content/days.ts` as `video: { length, url? }`.
Add the produced video URL per day (YouTube/Vimeo embed URL, or a direct `.mp4`).
Until a URL is set, the player shows the branded play-button placeholder.

---

## The Day-7 report

When a user locks Day 7 PM, the server gathers all their `responses`, sends them to
`claude-sonnet-4-6` with a strict "use only what they wrote" system prompt, stores
the markdown in `reports`, renders it at `/report`, and emails it via Resend.

---

## Project structure

```
src/
  app/
    page.tsx                 landing / enroll
    me/page.tsx              progress dashboard
    day/[n]/am/page.tsx      morning flow
    day/[n]/pm/page.tsx      evening flow
    report/page.tsx          Day-7 week-in-review
    auth/callback/route.ts   magic-link verify → session
    api/
      auth/send-link/route.ts
      responses/route.ts     save answers + complete blocks + trigger report
      logout/route.ts
  components/                AM/PM flows + reusable exercise components
  content/days.ts            ALL copy for all 7 days (single source of truth)
  lib/                       auth, supabase, email, report, progress, types
supabase/schema.sql          run this in Supabase
```
