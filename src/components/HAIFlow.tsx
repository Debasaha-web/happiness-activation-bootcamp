"use client";

import { useState } from "react";
import haiData from "@/content/hai-questions.json";

// Flatten all 25 questions in order
const ALL_QUESTIONS = haiData.sections.flatMap((s) =>
  s.questions.map((q) => ({ ...q, sectionId: s.id, sectionTitle: s.title }))
);
const TOTAL = ALL_QUESTIONS.length;

type Phase = "pre" | "post";
type Screen = "intro" | "questions" | "submitting" | "result";

interface ResultData {
  section1: number;
  section2: number;
  section3: number;
  total: number;
  tier: string;
  lift: number | null;
  tierChange: { from: string; to: string } | null;
  pre: { total: number; tier: string; section1: number; section2: number; section3: number } | null;
}

const TIER_COLORS: Record<string, string> = {
  Reactive:  "#8a6a3a",
  Aware:     "#c8a04a",
  Activated: "#5a9a6a",
  Mastery:   "#4a8ab0",
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  Reactive:  "Happiness happens to you.",
  Aware:     "You see the levers but don't pull them yet.",
  Activated: "You're using the methodology in real life.",
  Mastery:   "You've made it your operating system.",
};

export default function HAIFlow({ phase }: { phase: Phase }) {
  const [screen, setScreen] = useState<Screen>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL).fill(null));
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = ALL_QUESTIONS[current];
  const answer = answers[current];
  const progress = Math.round((current / TOTAL) * 100);

  function select(val: number) {
    const next = [...answers];
    next[current] = val;
    setAnswers(next);
  }

  function goNext() {
    if (current < TOTAL - 1) {
      setCurrent((c) => c + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  }

  function goBack() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submit() {
    setScreen("submitting");
    try {
      const res = await fetch("/api/hai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, phase }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setResult({
        section1: data.attempt.section1,
        section2: data.attempt.section2,
        section3: data.attempt.section3,
        total: data.attempt.total,
        tier: data.attempt.tier,
        lift: data.lift,
        tierChange: data.tierChange,
        pre: data.pre,
      });
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong saving your results. Please try again.");
      setScreen("questions");
    }
  }

  // ── INTRO ──
  if (screen === "intro") {
    return (
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">
            {phase === "pre" ? "Pre-Assessment" : "Post-Assessment"}
          </div>
          <h1>
            Happiness <span className="glow">Index</span>
          </h1>
          <p>
            {phase === "pre"
              ? "25 questions. 3 minutes. This is your baseline — where you are right now before the bootcamp."
              : "You've completed the 7-day bootcamp. Take the same 25 questions and see exactly how far you've moved."}
          </p>
          <div className="clock">
            <span className="dot" /> 25 questions · ~3 minutes
          </div>
        </div>
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              background: "var(--navy3)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "20px 24px",
              marginBottom: 24,
            }}
          >
            <p style={{ color: "var(--cream)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Rate each statement honestly on a scale of <strong style={{ color: "var(--lime)" }}>1 to 5</strong>. There are no right or wrong answers — this is data, not a test.
            </p>
          </div>
          <button
            className="btn btn-lime btn-block"
            onClick={() => { setScreen("questions"); window.scrollTo({ top: 0 }); }}
          >
            Begin Assessment →
          </button>
        </div>
        <div className="foot">
          The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
        </div>
      </div>
    );
  }

  // ── SUBMITTING ──
  if (screen === "submitting") {
    return (
      <div className="wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <p style={{ color: "var(--cream)" }}>Scoring your assessment…</p>
      </div>
    );
  }

  // ── RESULT ──
  if (screen === "result" && result) {
    const tierColor = TIER_COLORS[result.tier] || "var(--lime)";
    const isPost = phase === "post";

    return (
      <div className="wrap">
        {/* Post-test lift preview */}
        {isPost && result.lift !== null && (
          <div
            style={{
              background: "var(--navy3)",
              border: `2px solid var(--lime)`,
              borderRadius: 12,
              padding: "24px",
              textAlign: "center",
              marginBottom: 28,
              animation: "fadeUp 0.5s ease forwards",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--lime)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              Your Lift
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, color: "var(--lime)", lineHeight: 1 }}>
              +{result.lift}
            </div>
            <div style={{ fontSize: 15, color: "var(--cream)", marginTop: 8 }}>
              points in 7 days
            </div>
            {result.tierChange && (
              <div style={{ marginTop: 16, fontSize: 14, color: "var(--cream)" }}>
                <span style={{ color: TIER_COLORS[result.tierChange.from] || "var(--muted)" }}>
                  {result.tierChange.from}
                </span>
                {" → "}
                <span style={{ color: TIER_COLORS[result.tierChange.to] || "var(--lime)", fontWeight: 700 }}>
                  {result.tierChange.to}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Result card */}
        <div
          style={{
            background: "var(--navy3)",
            border: `1px solid ${tierColor}`,
            borderRadius: 12,
            padding: "28px 24px",
            marginBottom: 24,
            animation: "fadeUp 0.5s ease forwards",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              {phase === "pre" ? "Your Baseline" : "Your Result"}
            </div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 700,
                color: tierColor,
                lineHeight: 1,
              }}
            >
              {result.total}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              out of 125
            </div>
            <div
              style={{
                marginTop: 16,
                display: "inline-block",
                padding: "6px 18px",
                background: `${tierColor}22`,
                border: `1px solid ${tierColor}`,
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 700,
                color: tierColor,
              }}
            >
              {result.tier}
            </div>
            <p style={{ color: "var(--cream)", fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>
              {TIER_DESCRIPTIONS[result.tier]}
            </p>
          </div>

          {/* Section scores */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Baseline Wellbeing", score: result.section1, max: 50, pre: result.pre?.section1 },
              { label: "Mindset Agency", score: result.section2, max: 50, pre: result.pre?.section2 },
              { label: "Perspective & Mission", score: result.section3, max: 25, pre: result.pre?.section3 },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--navy2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "14px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, lineHeight: 1.4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--cream)", lineHeight: 1 }}>
                  {s.score}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>/ {s.max}</div>
                {isPost && s.pre !== undefined && (
                  <div style={{ fontSize: 11, color: "var(--lime)", marginTop: 4 }}>
                    +{s.score - s.pre}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {phase === "pre" && (
          <div
            style={{
              background: "var(--navy3)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 24,
              fontSize: 14,
              color: "var(--cream)",
              lineHeight: 1.6,
            }}
          >
            Your baseline is locked in. Come back after Day 7 to see your lift.
          </div>
        )}

        <button
          className="btn btn-lime btn-block"
          onClick={() => { history.back(); }}
        >
          Close Window
        </button>
        <div className="foot">
          The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
        </div>
      </div>
    );
  }

  // ── QUESTIONS ──
  return (
    <div className="wrap">
      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          <span>Question {current + 1} of {TOTAL}</span>
          <span>{q.sectionTitle}</span>
        </div>
        <div
          style={{
            height: 3,
            background: "var(--navy3)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #a8e000, #C6FF3D)",
              borderRadius: 999,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Section chip */}
      <div
        style={{
          display: "inline-block",
          padding: "4px 12px",
          border: "1px solid var(--border)",
          borderRadius: 999,
          fontSize: 11,
          color: "var(--muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 20,
        }}
      >
        Section {q.sectionId} · {q.sectionTitle}
      </div>

      {/* Question */}
      <h2
        style={{
          fontSize: "clamp(20px, 5vw, 26px)",
          fontWeight: 600,
          color: "var(--cream)",
          lineHeight: 1.3,
          marginBottom: 32,
        }}
      >
        {q.text}
      </h2>

      {/* Scale */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--muted)",
            marginBottom: 10,
          }}
        >
          <span>1 — {q.low}</span>
          <span>5 — {q.high}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              onClick={() => select(val)}
              style={{
                padding: "18px 0",
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 10,
                border: `2px solid ${answer === val ? "var(--lime)" : "var(--border)"}`,
                background: answer === val ? "rgba(198,255,61,0.12)" : "var(--navy3)",
                color: answer === val ? "var(--lime)" : "var(--cream)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ color: "#e88", fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        {current > 0 && (
          <button
            onClick={goBack}
            style={{
              flex: "0 0 auto",
              padding: "14px 20px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--muted)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        )}
        <button
          className="btn btn-lime btn-block"
          style={{ flex: 1 }}
          disabled={answer === null}
          onClick={goNext}
        >
          {current === TOTAL - 1 ? "See My Results →" : "Next →"}
        </button>
      </div>

      <div className="foot">
        The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
      </div>
    </div>
  );
}
