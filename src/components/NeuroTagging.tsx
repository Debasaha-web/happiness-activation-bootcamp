"use client";

import type { NeuroTagRep } from "@/content/days";

export default function NeuroTagging({
  help,
  reps,
  values,
  onChange,
}: {
  help: string;
  reps: NeuroTagRep[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <>
      <div className="card">
        <p className="help">{help}</p>
      </div>
      {reps.map((rep) => (
        <div className="card" key={rep.key}>
          <div className="qnum">
            Rep {rep.rep} · {rep.label}
          </div>
          <div className="q">{rep.question}</div>
          <textarea
            placeholder={rep.placeholder}
            value={values[rep.key] ?? ""}
            onChange={(e) => onChange(rep.key, e.target.value)}
          />
        </div>
      ))}
    </>
  );
}
