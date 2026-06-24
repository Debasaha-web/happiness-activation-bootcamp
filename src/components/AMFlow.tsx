"use client";

import { useRef, useState } from "react";
import type { Day } from "@/content/days";
import type { AnswerPayload } from "@/lib/types";
import TopBar from "./TopBar";
import Video from "./Video";
import Scenario from "./Scenario";
import NeuroTagging from "./NeuroTagging";
import RAS from "./RAS";
import VerbalEncoding from "./VerbalEncoding";

export default function AMFlow({ day }: { day: Day }) {
  // Progressive reveal: 0 = scenario only → 1 tagging → 2 ras → 3 verbal.
  const [stage, setStage] = useState(0);
  const [tagValues, setTagValues] = useState<Record<string, string>>({});
  const [rasValues, setRasValues] = useState<Record<string, string>>({});
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const taggingRef = useRef<HTMLDivElement | null>(null);
  const rasRef = useRef<HTMLDivElement | null>(null);
  const verbalRef = useRef<HTMLDivElement | null>(null);

  const progress = [12, 32, 52, 72][stage] ?? 12;

  const reveal = (next: number, ref: React.RefObject<HTMLDivElement | null>) => {
    setStage((s) => Math.max(s, next));
    setTimeout(
      () => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      40
    );
  };

  const set = (
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => (key: string, value: string) => setter((p) => ({ ...p, [key]: value }));

  const toggleMic = () => {
    setRecording((r) => {
      if (r) setRecorded(true);
      return !r;
    });
  };

  async function finishMorning() {
    setSaving(true);
    setError(null);

    const answers: AnswerPayload[] = [];
    for (const rep of day.neuroTagging.reps) {
      answers.push({
        promptKey: rep.key,
        exercise: "neuro_tagging",
        format: "text",
        scenarioTied: true,
        valueText: tagValues[rep.key] ?? "",
      });
    }
    for (const p of day.ras.prompts) {
      answers.push({
        promptKey: p.key,
        exercise: "ras",
        format: "text",
        scenarioTied: false,
        valueText: rasValues[p.key] ?? "",
      });
    }
    // Verbal encoding — mark-complete only (no audio stored).
    answers.push({
      promptKey: `d${day.day}_verbal`,
      exercise: "verbal_encoding",
      format: "voice",
      scenarioTied: true,
      valueBool: recorded,
    });

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: day.day,
          block: "am",
          answers,
          complete: true,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Couldn't save your morning.");
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  }

  if (done) {
    return (
      <>
        <TopBar pill={`Day ${day.day} · ${day.mindset}`} progress={100} accent="am" />
        <div className="wrap">
          <div className="done">
            <div style={{ fontSize: 48, marginBottom: 12 }}>☀️</div>
            <h3>Morning Complete</h3>
            <p>
              Your {day.mindset} training is locked in. Come back tonight for
              your PM workout to close out Day {day.day}.
            </p>
            <p
              style={{
                color: "var(--lime)",
                marginTop: 10,
                fontFamily: '"Archivo", sans-serif',
                fontWeight: 700,
              }}
            >
              See you tonight →
            </p>
            <button
              className="btn btn-lime btn-block"
              style={{ marginTop: 22 }}
              onClick={() => { history.back(); }}
            >
              Close Window
            </button>
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
      <TopBar pill={`Day ${day.day} · ${day.mindset}`} progress={progress} accent="am" />
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Morning Activation</div>
          <h1>
            {day.display.head}
            <span className="glow">{day.display.glow}</span>
          </h1>
          <p>{day.tagline}</p>
          <div className="clock">
            <span className="dot" /> ~10 min · Morning
          </div>
        </div>

        {/* 1 — Hype video */}
        <div className="block">
          <div className="block-head">
            <div className="stepno">1</div>
            <h2>The Hype</h2>
            <div className="tag">Watch</div>
          </div>
          <Video
            label={`${day.mindset} · Day ${day.day}`}
            length={day.video.length}
            url={day.video.url}
          />
        </div>

        {/* 2 — Scenario */}
        <div className="block">
          <div className="block-head">
            <div className="stepno">2</div>
            <h2>The Scenario</h2>
            <div className="tag">Read · Picture it</div>
          </div>
          <Scenario
            label={day.scenario.label}
            paragraphs={day.scenario.paragraphs}
            continued={stage >= 1}
            onContinue={() => reveal(1, taggingRef)}
          />
        </div>

        {/* 3 — Neuro-Tagging */}
        {stage >= 1 && (
          <div className="block" ref={taggingRef}>
            <div className="block-head">
              <div className="stepno">3</div>
              <h2>Neuro-Tagging</h2>
              <div className="tag">Type · 3 reps</div>
            </div>
            <NeuroTagging
              help={day.neuroTagging.help}
              reps={day.neuroTagging.reps}
              values={tagValues}
              onChange={set(setTagValues)}
            />
            {stage < 2 && (
              <button
                className="btn btn-lime btn-block"
                style={{ marginTop: 14 }}
                onClick={() => reveal(2, rasRef)}
              >
                Lock it in →
              </button>
            )}
          </div>
        )}

        {/* 4 — RAS Activation */}
        {stage >= 2 && (
          <div className="block" ref={rasRef}>
            <div className="block-head">
              <div className="stepno">4</div>
              <h2>RAS Activation</h2>
              <div className="tag">2 gratitudes</div>
            </div>
            <RAS
              help={day.ras.help}
              prompts={day.ras.prompts}
              values={rasValues}
              onChange={set(setRasValues)}
            />
            {stage < 3 && (
              <button
                className="btn btn-lime btn-block"
                style={{ marginTop: 14 }}
                onClick={() => reveal(3, verbalRef)}
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {/* 5 — Verbal Encoding */}
        {stage >= 3 && (
          <div className="block" ref={verbalRef}>
            <div className="block-head">
              <div className="stepno">5</div>
              <h2>Verbal Encoding</h2>
              <div className="tag">Say it out loud</div>
            </div>
            <VerbalEncoding
              help={day.verbalEncoding.help}
              prompt={day.verbalEncoding.prompt}
              recorded={recorded}
              recording={recording}
              onToggle={toggleMic}
            />
            {error && <div className="notice err">{error}</div>}
            <button
              className="btn btn-lime btn-block"
              style={{ marginTop: 14 }}
              onClick={finishMorning}
              disabled={saving}
            >
              {saving ? "Saving…" : "Finish morning →"}
            </button>
          </div>
        )}

        <div className="foot">
          The AEA Institute · Happiness Activation Bootcamp · ABM 3.0
        </div>
      </div>
    </>
  );
}
