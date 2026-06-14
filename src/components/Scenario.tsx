"use client";

import type { Paragraph } from "@/content/days";

export default function Scenario({
  label,
  paragraphs,
  onContinue,
  continued,
}: {
  label: string;
  paragraphs: Paragraph[];
  onContinue: () => void;
  continued: boolean;
}) {
  return (
    <div className="scenario">
      <div className="label">⬤ {label}</div>
      {paragraphs.map((para, i) => (
        <p key={i}>
          {para.map((seg, j) =>
            seg.tone ? (
              <span key={j} className={seg.tone}>
                {seg.t}
              </span>
            ) : (
              <span key={j}>{seg.t}</span>
            )
          )}
        </p>
      ))}
      {!continued && (
        <button className="btn btn-lime btn-block continue" onClick={onContinue}>
          I&apos;m picturing it →
        </button>
      )}
    </div>
  );
}
