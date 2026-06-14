"use client";

import { useEffect, useRef, useState } from "react";

// Mindset Bursting — algorithm unchanged: a 45-second evidence scan.
// One textarea, a 45s countdown framing, go fast / don't edit.
export default function MindsetBursting({
  prompt,
  value,
  onChange,
}: {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const start = () => {
    if (timer.current) clearInterval(timer.current);
    setSecondsLeft(45);
    taRef.current?.focus();
    timer.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return null;
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  return (
    <div className="card">
      <p className="help" style={{ marginBottom: 14 }}>
        {prompt}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <button
          className="btn btn-ghost"
          style={{ padding: "9px 14px", fontSize: 12.5 }}
          onClick={start}
        >
          {secondsLeft === null ? "Start 45s ⏱" : "Restart ⏱"}
        </button>
        {secondsLeft !== null && (
          <span
            style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontSize: 20,
              color: secondsLeft === 0 ? "var(--mist)" : "var(--violet)",
            }}
          >
            {secondsLeft === 0 ? "Time" : `0:${String(secondsLeft).padStart(2, "0")}`}
          </span>
        )}
      </div>
      <textarea
        ref={taRef}
        style={{ minHeight: 110 }}
        placeholder="Go — fast, messy, everything…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
