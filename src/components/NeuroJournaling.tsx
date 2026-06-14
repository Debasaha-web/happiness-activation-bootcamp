"use client";

import type {
  TFQuestion,
  DropdownQuestion,
  OpenQuestion,
} from "@/content/days";

const ScenarioTag = () => (
  <span style={{ color: "var(--orange)" }}> (scenario)</span>
);

export default function NeuroJournaling({
  tf,
  dropdown,
  open,
  tfValues,
  ddValues,
  openValues,
  onTF,
  onDropdown,
  onOpen,
}: {
  tf: TFQuestion[];
  dropdown: DropdownQuestion[];
  open: OpenQuestion[];
  tfValues: Record<string, boolean | undefined>;
  ddValues: Record<string, string>;
  openValues: Record<string, string>;
  onTF: (key: string, value: boolean) => void;
  onDropdown: (key: string, value: string) => void;
  onOpen: (key: string, value: string) => void;
}) {
  return (
    <>
      {/* True / False */}
      <div className="card">
        <div className="qnum pm">Quick taps · True / False</div>
        {tf.map((q) => (
          <div className="qrow" key={q.key}>
            <div className="q">
              {q.question}
              {q.scenarioTied && <ScenarioTag />}
            </div>
            <div className="tf">
              <button
                aria-pressed={tfValues[q.key] === true}
                onClick={() => onTF(q.key, true)}
              >
                True
              </button>
              <button
                aria-pressed={tfValues[q.key] === false}
                onClick={() => onTF(q.key, false)}
              >
                False
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dropdown */}
      <div className="card">
        <div className="qnum pm">Guided choice · Dropdown</div>
        {dropdown.map((q) => (
          <div className="qrow" key={q.key}>
            <div className="q">
              {q.question}
              {q.scenarioTied && <ScenarioTag />}
            </div>
            <select
              value={ddValues[q.key] ?? ""}
              onChange={(e) => onDropdown(q.key, e.target.value)}
            >
              <option value="">Choose one…</option>
              {q.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Open */}
      <div className="card">
        <div className="qnum pm">Written reflection · Open</div>
        {open.map((q) => (
          <div className="qrow" key={q.key}>
            <div className="q">
              {q.question}
              {q.scenarioTied && <ScenarioTag />}
            </div>
            <textarea
              placeholder={q.placeholder}
              value={openValues[q.key] ?? ""}
              onChange={(e) => onOpen(q.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
