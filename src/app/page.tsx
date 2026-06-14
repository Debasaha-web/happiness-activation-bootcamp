import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import EnrollForm from "@/components/EnrollForm";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/me");

  const { error } = await searchParams;
  const errMsg =
    error === "expired"
      ? "That link expired. Enter your email for a fresh one."
      : error === "missing-token"
        ? "That link was incomplete. Try again below."
        : error === "server"
          ? "Something hiccupped on our end. Try once more."
          : null;

  return (
    <div className="wrap">
      <div className="hero">
        <div className="eyebrow">7-Day Mental Fitness Bootcamp</div>
        <h1>
          Happi<span className="glow">ness</span>
        </h1>
        <p>
          Twenty minutes a day. One trainable mindset at a time. Seven days to a
          new baseline.
        </p>
        <div className="clock">
          <span className="dot" /> Gratitude → Purpose · 7 days
        </div>
      </div>

      <p className="lede" style={{ marginTop: 22 }}>
        This isn&apos;t passive. Each day you read a scene, type your way through
        it, and train the mindset like a muscle — morning and evening. Clinically
        anchored to a 2024 study showing a 35% lift on the Oxford Happiness Scale.
      </p>

      {errMsg && (
        <div className="notice err" style={{ marginTop: 16 }}>
          {errMsg}
        </div>
      )}

      <EnrollForm />

      <div className="foot">
        The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
      </div>
    </div>
  );
}
