"use client";

// Voice storage decision (v1): mark-complete only. The record button is a real
// interaction, but we persist only a "completed" flag — no audio upload.
export default function VerbalEncoding({
  help,
  prompt,
  recorded,
  recording,
  onToggle,
}: {
  help: string;
  prompt: string;
  recorded: boolean;
  recording: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card">
      <p className="help" style={{ marginBottom: 14 }}>
        {help}
      </p>
      <div className="q" style={{ marginBottom: 14 }}>
        {prompt}
      </div>
      <div className="mic">
        <button
          className={`mic-btn${recording ? " rec" : ""}`}
          onClick={onToggle}
          aria-label={recording ? "Stop recording" : "Record"}
          aria-pressed={recording}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
          </svg>
        </button>
        <div className="txt">
          <b>
            {recording
              ? "Recording…"
              : recorded
                ? "Recorded ✓"
                : "Tap to record"}
          </b>
          <span>
            {recording
              ? "Tap again to stop"
              : recorded
                ? "Tap to re-record"
                : "Hold the moment in your voice"}
          </span>
        </div>
      </div>
    </div>
  );
}
