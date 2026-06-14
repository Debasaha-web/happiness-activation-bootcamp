"use client";

import { useState } from "react";

export default function EnrollForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    setDevLink(null);
    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Something went wrong.");
      setStatus("sent");
      setMessage(`Check ${email} for your link — it signs you in instantly.`);
      if (j.devLink) setDevLink(j.devLink);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="card" style={{ marginTop: 20 }}>
        <div className="notice ok">{message}</div>
        {devLink && (
          <a
            href={devLink}
            className="btn btn-lime btn-block"
            style={{ marginTop: 14 }}
          >
            Dev: open my link →
          </a>
        )}
      </div>
    );
  }

  return (
    <form className="card" style={{ marginTop: 20 }} onSubmit={submit}>
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name is fine"
        />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
      </div>
      {status === "error" && <div className="notice err">{message}</div>}
      <button
        className="btn btn-lime btn-block"
        style={{ marginTop: 16 }}
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send my magic link →"}
      </button>
      <p
        style={{
          color: "var(--mist)",
          fontSize: 12.5,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        No password. We email you a one-tap link.
      </p>
    </form>
  );
}
