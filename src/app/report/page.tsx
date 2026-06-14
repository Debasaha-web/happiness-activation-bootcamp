import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { supabaseAdmin } from "@/lib/supabase";
import { generateReport, markdownToHtml } from "@/lib/report";
import TopBar from "@/components/TopBar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function ReportPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const progress = await getProgress(session.userId);
  const db = supabaseAdmin();

  // Pull an existing report, or generate one if the week is complete.
  let summaryMd: string | null = null;
  const { data: existing } = await db
    .from("reports")
    .select("summary_md")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (existing?.summary_md) {
    summaryMd = existing.summary_md as string;
  } else if (progress.completedAt) {
    try {
      summaryMd = await generateReport(session.userId);
      await db
        .from("reports")
        .upsert(
          { user_id: session.userId, summary_md: summaryMd, delivered: false },
          { onConflict: "user_id" }
        );
    } catch {
      summaryMd = null;
    }
  }

  if (!summaryMd) {
    return (
      <>
        <TopBar pill="Week Review" progress={100} accent="pm" />
        <div className="wrap">
          <div className="hero">
            <div className="eyebrow pm">Week in Review</div>
            <h1 className="sm">
              Almost <span className="glow pm">There</span>
            </h1>
            <p>
              Your review unlocks when all 7 days are locked in. Finish the week
              and it&apos;ll be waiting here.
            </p>
          </div>
          <Link
            href="/me"
            className="btn btn-lime btn-block"
            style={{ marginTop: 18 }}
          >
            Back to my training →
          </Link>
          <div className="foot">
            The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar pill="Week Review" progress={100} accent="pm" />
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow pm">Your Week, Reviewed</div>
          <h1 className="sm">
            7 Days, <span className="glow pm">Trained</span>
          </h1>
          <p>Written from your own words, across all seven mindsets.</p>
        </div>

        <div
          className="report"
          style={{ marginTop: 18 }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(summaryMd) }}
        />

        <Link
          href="/me"
          className="btn btn-ghost btn-block"
          style={{ marginTop: 18 }}
        >
          Back to my training
        </Link>

        <div className="foot">
          The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
        </div>
      </div>
    </>
  );
}
