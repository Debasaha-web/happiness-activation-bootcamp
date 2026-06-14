"use client";

import { useState } from "react";

// Embeds the day's hype video. Until a real URL is wired in content/days.ts,
// it shows the mockup's glowing play-button placeholder.
export default function Video({
  label,
  length,
  url,
}: {
  label: string;
  length: string;
  url?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (url && playing) {
    const isFile = /\.(mp4|webm|mov)$/i.test(url);
    return (
      <div className="video">
        {isFile ? (
          <video src={url} controls autoPlay playsInline />
        ) : (
          <iframe
            src={url}
            title={label}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="video"
      role="button"
      tabIndex={0}
      aria-label={`Play ${label}`}
      onClick={() => url && setPlaying(true)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && url) setPlaying(true);
      }}
    >
      <div className="play" />
      <div className="meta">{label}</div>
      <div className="len">{length}</div>
    </div>
  );
}
