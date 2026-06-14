import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { DAYS, TOTAL_DAYS } from "@/content/days";
import TopBar from "@/components/TopBar";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await getSession();
  if (!session) redirect("/");

  const progress = await getProgress(session.userId);
  const completedDays = Object.values(progress.days).filter(
    (d) => d.amComplete && d.pmComplete
  ).length;
  const pct = Math.round((completedDays / TOTAL_DAYS) * 100);

  const current = progress.completedAt ? TOTAL_DAYS : progress.currentDay;
  const todayBlock =
    progress.days[current]?.amComplete && !progress.days[current]?.pmComplete
      ? "pm"
      : "am";

  return (
    <>
      <TopBar pill="My Training" progress={pct} accent="am" />
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">My Training</div>
          <h1>
            Day <span className="glow">{current}</span>
          </h1>
          <p>
            {progress.completedAt
              ? "All 7 days trained. This is your new baseline."
              : `${completedDays} of ${TOTAL_DAYS} days locked. Keep the streak alive.`}
          </p>
        </div>

        <div className="daygrid">
          {DAYS.map((d) => {
            const p = progress.days[d.day];
            const isDone = p?.amComplete && p?.pmComplete;
            const isCurrent = d.day === current && !progress.completedAt;
            const isLocked = d.day > current && !progress.completedAt;
            const cls = isDone
              ? "d done"
              : isCurrent
                ? "d current"
                : isLocked
                  ? "d locked"
                  : "d";
            const content = <span>{d.day}</span>;
            return isLocked ? (
              <div key={d.day} className={cls} title={`Day ${d.day} · locked`}>
                {content}
              </div>
            ) : (
              <Link
                key={d.day}
                href={`/day/${d.day}/${isCurrent ? todayBlock : "am"}`}
                className={cls}
                title={`Day ${d.day} · ${d.mindset}`}
              >
                {content}
              </Link>
            );
          })}
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <div className="qnum">
            {progress.completedAt ? "Your week" : `Up next · Day ${current}`}
          </div>
          <div className="q" style={{ marginBottom: 14 }}>
            {progress.completedAt
              ? "Revisit any day, or read your week-in-review."
              : `${DAYS[current - 1]?.mindset} — ${DAYS[current - 1]?.tagline}`}
          </div>
          {progress.completedAt ? (
            <Link href="/report" className="btn btn-lime btn-block">
              See my week-in-review →
            </Link>
          ) : (
            <Link
              href={`/day/${current}/${todayBlock}`}
              className="btn btn-lime btn-block"
            >
              {todayBlock === "pm"
                ? "Finish tonight's lock-in →"
                : `Train Day ${current} →`}
            </Link>
          )}
        </div>

        <div className="foot">
          The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
        </div>
      </div>
    </>
  );
}
