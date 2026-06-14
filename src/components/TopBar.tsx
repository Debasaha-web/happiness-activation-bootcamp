"use client";

import Link from "next/link";

export default function TopBar({
  pill,
  progress,
  accent = "am",
}: {
  pill: string;
  progress: number; // 0–100
  accent?: "am" | "pm";
}) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/me" className="brand">
          Happiness <b>Activation</b>
        </Link>
        <div className={`daypill${accent === "pm" ? " pm" : ""}`}>{pill}</div>
      </div>
      <div className="progress">
        <i style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
      </div>
    </div>
  );
}
