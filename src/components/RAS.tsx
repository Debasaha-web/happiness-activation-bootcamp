"use client";

import type { RASPrompt } from "@/content/days";

export default function RAS({
  help,
  prompts,
  values,
  onChange,
}: {
  help: string;
  prompts: RASPrompt[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <>
      <div className="card">
        <p className="help">{help}</p>
      </div>
      {prompts.map((p, i) => (
        <div className="card" key={p.key}>
          <div className="qnum">Gratitude {i + 1}</div>
          <div className="q">{p.question}</div>
          <textarea
            placeholder={p.placeholder}
            value={values[p.key] ?? ""}
            onChange={(e) => onChange(p.key, e.target.value)}
          />
        </div>
      ))}
    </>
  );
}
