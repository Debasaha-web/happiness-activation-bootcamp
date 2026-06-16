"use client";

import { useState } from "react";
import Link from "next/link";
import type { Day } from "@/content/days";
import type { AnswerPayload } from "@/lib/types";
import TopBar from "./TopBar";
import Video from "./Video";
import Scenario from "./Scenario";
import NeuroJournaling from "./NeuroJournaling";
import MindsetBursting from "./MindsetBursting";
import BeltMedallion from "./BeltMedallion";

export default function PMFlow({ day }: { day: Day }) {
  const [tfValues, setTfValues] = useState<Record<string, boolean | undefined>>({});
  const [ddValues, setDdValues] = useState<Record<string, string>>({});
  const [openValues, setOpenValues] = useState<Record<string, string>>({});
  const [burst, setBurst] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{
    advancedTo: number;
    weekComplete: boolean;
    reportReady: boolean;
  } | null>(null);

  const progress = done ? 100 : 78;

  async function lockTheDay() {
    setSaving(true);
    setError(null);

    const answers: AnswerPayload[] = [];
    for (const q of day.neuroJournaling.tf) {
      answers.push({
        promptKey: q.key,
        exercise: "neuro_journaling",
        format: "tf",
        scenarioTied: q.scenarioTied,
        valueBool: tfValues[q.key] ?? null,
      });
    }
    for (const q of day.neuroJournaling.dropdown) {
      answers.push({
        promptKey: q.key,
        exercise: "neuro_journaling",
        format: "dropdown",
        scenarioTied: q.scenarioTied,
        valueChoice: ddValues[q.key] ?? null,
      });
    }
    for (const q of day.neuroJournaling.open) {
      answers.push({
        promptKey: q.key,
        exercise: "neuro_journaling",
        format: "text",
        scenarioTied: q.scenarioTied,
        valueText: openValues[q.key] ?? "",
      });
    }
    answers.push({
      promptKey: `d${day.day}_burst`,
      exercise: "mindset_bursting",
      format: "burst",
      scenarioTied: false,
      valueText: burst,
    });

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: day.day,
          block: "pm",
          answers,
          complete: true,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Couldn't lock the day.");
      setResult({
        advancedTo: j.advancedTo ?? day.day,
        weekComplete: !!j.weekComplete,
        reportReady: !!j.reportReady,
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (done && result) {
    return (
      <>
        <TopBar pill={`Day ${day.day} · ${day.mindset}`} progress={100} accent="pm" />
        <div className="wrap">
          <div className="done">
            <BeltMedallion day={day.day} />
            <h3>Day {day.day} Locked</h3>
            <p>
              {day.mindset} is trained. Your brain now has a new thing to look
              for tomorrow.
            </p>

            {result.weekComplete ? (
              <>
                <p
                  style={{
                    color: "var(--lime)",
                    marginTop: 10,
                    fontFamily: '"Archivo", sans-serif',
                    fontWeight: 700,
                  }}
                >
                  All 7 days trained. A new baseline. →
                </p>
                <Link
                  href="/report"
                  className="btn btn-lime btn-block"
                  style={{ marginTop: 22 }}
                >
                  See your week-in-review →
                </Link>
              </>
            ) : (
              <>
                <p
                  style={{
                    color: "var(--lime)",
                    marginTop: 10,
                    fontFamily: '"Archivo", sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {7 - day.day} day{7 - day.day === 1 ? "" : "s"} to your new
                  baseline →
                </p>
                <p style={{ marginTop: 8, fontSize: 14, color: "var(--muted)" }}>
                  Come back tomorrow for Day {result.advancedTo} via your Kajabi lesson.
                </p>
                <button
                  className="btn btn-lime btn-block"
                  style={{ marginTop: 22 }}
                  onClick={() => window.close()}
                >
                  Close Window
                </button>
              </>
            )}
          </div>
          <div className="foot">
            The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar pill={`Day ${day.day} · ${day.mindset}`} progress={progress} accent="pm" />
      <div className="wrap">
        <div className="pmgate" style={{ marginTop: 18 }}>
          <div className="ln" />
          <span>Evening · Lock-in</span>
        </div>

        <div className="hero" style={{ paddingTop: 24 }}>
          <div className="eyebrow pm">Evening Lock-In</div>
          <h1 className="sm">
            The <span className="glow pm">Debrief</span>
          </h1>
          <p>Same mindset. New evidence. Close the loop on today.</p>
        </div>

        {/* 6 — Video replay */}
        <div className="block">
          <div className="block-head">
            <div className="stepno">6</div>
            <h2>Replay the Original Video</h2>
            <div className="tag">Watch again</div>
          </div>
          <Video
            label={`${day.mindset} · Replay`}
            length={day.video.length}
            url={day.video.url}
          />
        </div>

        {/* 6b — Re-read this morning's scenario */}
        <div className="block">
          <div className="block-head">
            <div className="stepno">6b</div>
            <h2>Re-read This Morning&apos;s Scenario</h2>
            <div className="tag">Read again</div>
          </div>
          <Scenario
            label={day.scenario.label}
            paragraphs={day.scenario.paragraphs}
            continued={true}
            onContinue={() => {}}
          />
        </div>

        {/* 7 — Neuro-Journaling */}
        <div className="block">
          <div className="block-head">
            <div className="stepno">7</div>
            <h2>Neuro-Journaling</h2>
            <div className="tag">9 questions</div>
          </div>
          <NeuroJournaling
            tf={day.neuroJournaling.tf}
            dropdown={day.neuroJournaling.dropdown}
            open={day.neuroJournaling.open}
            tfValues={tfValues}
            ddValues={ddValues}
            openValues={openValues}
            onTF={(k, v) => setTfValues((p) => ({ ...p, [k]: v }))}
            onDropdown={(k, v) => setDdValues((p) => ({ ...p, [k]: v }))}
            onOpen={(k, v) => setOpenValues((p) => ({ ...p, [k]: v }))}
          />
        </div>

        {/* 8 — Mindset Bursting */}
        <div className="block">
          <div className="block-head">
            <div className="stepno">8</div>
            <h2>Mindset Bursting</h2>
            <div className="tag">45 seconds</div>
          </div>
          <MindsetBursting
            prompt={day.mindsetBursting.prompt}
            value={burst}
            onChange={setBurst}
          />
          {error && <div className="notice err">{error}</div>}
          <button
            className="btn btn-violet btn-block"
            style={{ marginTop: 14 }}
            onClick={lockTheDay}
            disabled={saving}
          >
            {saving ? "Locking…" : "Lock the day 🔒"}
          </button>
        </div>

        <div className="foot">
          The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
        </div>
      </div>
    </>
  );
}
