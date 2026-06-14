# Handoff — Happiness Activation Bootcamp

**To:** DB · **From:** Eric (+ Claude) · **Date:** built June 14, 2026

You're finishing the last mile. The app is **already built, deployed, and fully
working in production** — infra is done. Your main job is the **7 videos**, a test
pass, and a redeploy. Budget ~1–2 hours.

**Live now:** https://activate-happiness.vercel.app
**Code:** `~/Desktop/activate-happiness` (on Eric's Mac; see "Getting the code")

---

## ✅ What's already done (don't redo these)

- Full Next.js app — all 7 days, AM + PM blocks, every exercise. All copy is in
  `src/content/days.ts` (single source of truth — edit there, never in components).
- **Supabase** — project provisioned, schema applied, RLS locked down, verified.
- **Auth** — frictionless: name + email instantly creates the account & signs in.
  No magic-link email, no Resend needed for login.
- **Anthropic** Day-7 report — `claude-sonnet-4-6`, wired + tested end-to-end.
  Generates on Day-7 PM completion, shows at `/report`.
- **Vercel** — project `activate-happiness` under the **AEA Team** scope, env vars
  set for Production + Development, deployed and aliased to the clean URL.

Everything works in prod right now **except the videos** (placeholder play button)
and **emailing** the report (it displays in-app; email is optional — see bottom).

---

## 🔑 Access — you already have it

You're already a collaborator on **Vercel (AEA Team)**, **Supabase**, and **GitHub**,
so nothing to request. You do **not** need the raw API keys — pull them from Vercel
with `vercel env pull` (see Local setup).

---

## Getting the code

There's no GitHub repo yet — it's a local git repo on Eric's Mac at
`~/Desktop/activate-happiness` (already committed, clean history). **You're set up to
do the GitHub step:**

1. Eric gives you the folder (zip excluding `node_modules`/`.next`/`.vercel`, AirDrop,
   or he pushes once and you take it from there).
2. Create a repo under the AEA org and push:
   ```bash
   cd activate-happiness
   git remote add origin git@github.com:YOUR-ORG/activate-happiness.git
   git push -u origin main
   ```
3. **Recommended:** in Vercel → `activate-happiness` → Settings → Git, connect the
   repo. Then every `git push` auto-deploys — no CLI needed.

> `.env.local` is gitignored and won't be in the repo — intentional. Regenerate it
> with `vercel env pull` (next section).

---

## Local setup (your machine)

```bash
cd activate-happiness
npm install

# Pull all secrets from Vercel into .env.local (needs Vercel access + login):
npx vercel login                 # if not already logged in
npx vercel link                  # choose: AEA Team → activate-happiness
npx vercel env pull .env.local --environment=development

npm run dev                      # http://localhost:3000
```

Sanity-check the wiring (optional, all should pass):
```bash
node scripts/verify-supabase.mjs     # DB connection + all 6 tables
node scripts/verify-anthropic.mjs    # Day-7 report model ping
```

---

## 🎬 THE MAIN TASK — add the 7 videos

Each day's video is referenced in `src/content/days.ts` as:
```ts
video: { length: "2:10" },        // ← currently no url, so a placeholder shows
```

### Step 1 — host the videos (get an embeddable URL for each)
Pick whichever Eric prefers:
- **YouTube (unlisted)** → use the embed URL: `https://www.youtube.com/embed/VIDEO_ID`
- **Vimeo** → `https://player.vimeo.com/video/VIDEO_ID`
- **Direct file** (Vercel Blob, Supabase Storage, S3, etc.) → a URL ending in
  `.mp4` / `.webm` / `.mov`

The `<Video>` component auto-detects: file extensions render as `<video>`, anything
else renders as an `<iframe>`. So YouTube/Vimeo embed URLs Just Work.

### Step 2 — paste the URL into each day
For each of the 7 days in `src/content/days.ts`, add `url` (and fix `length` to the
real runtime):
```ts
video: { length: "2:34", url: "https://www.youtube.com/embed/abc123" },
```
Day order in the file: 1 Gratitude · 2 Aspiration · 3 Mission · 4 Hope ·
5 Resilience · 6 Perspective · 7 Purpose. (The same video plays in AM and the PM
"replay" automatically — you only set it once per day.)

### Step 3 — verify locally
`npm run dev`, sign in, and on Day 1 the hype video should play. Spot-check a couple
of other days.

---

## Test pass (do this before deploying)

Walk one full day end-to-end on `localhost`:
1. `/` → enter name + email → lands on Day 1 AM.
2. Video plays → read scenario → "I'm picturing it" → type the 3 Neuro-Tagging reps
   → RAS → tap the mic (it just marks complete) → "Finish morning".
3. Day 1 PM → replay → 9 journaling questions → 45s Mindset Bursting → "Lock the day"
   → belt medallion → advances to Day 2.
4. (Optional full check) To see the **Day-7 report**, you'd complete all 7 days; or
   trust `scripts/test-report.mjs` which exercises that exact pipeline.

---

## Deploy to production

If you set up GitHub + Vercel git integration: just `git push` (auto-deploys).
Otherwise, from the project folder:
```bash
npx vercel deploy --prod --scope aea-institute-team
```
It aliases to https://activate-happiness.vercel.app automatically. Verify the videos
play on the live URL.

---

## Optional finishing touches

- **Kajabi button** — point it at `https://activate-happiness.vercel.app`. (Front
  door is either Kajabi OR a direct link; day URLs are `/day/[n]/am` & `/day/[n]/pm`.)
- **Email the Day-7 report (Resend)** — currently the report shows in-app at
  `/report` but isn't emailed. To enable email: create a Resend API key + verify a
  sending domain, then add `RESEND_API_KEY` (and a real `EMAIL_FROM`) in Vercel →
  Settings → Environment Variables (Production), and redeploy. Nothing breaks without
  it. Test with `node scripts/verify-resend.mjs you@email.com`.
- **Preview env vars** — only Production + Development are set. If you want Preview
  deploys to work, add the same vars for Preview (or `vercel env pull` per env).

---

## Notes / gotchas

- **All content edits go in `src/content/days.ts`.** Components are content-driven.
- **Auth has no email verification by design** (name+email = account). Eric chose
  this for zero friction; flag if he wants a 6-digit email code later.
- The old magic-link routes (`/api/auth/send-link`, `/auth/callback`) are unused but
  still present — harmless; ignore them.
- Verbal Encoding is **mark-complete only** (no audio stored) — intentional for v1.
- Never commit `.env.local` — it's gitignored. Only `.env.example` belongs in git.
- Project name must keep **happiness + activate** in the URL (don't rename the
  Vercel project).

Questions on any of it: the full architecture is in `README.md`.
