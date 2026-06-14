"use client";

import { useState } from "react";

export default function EnrollForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "starting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("starting");
    setMessage("");
    try {
      const res = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Something went wrong.");
      // Session cookie is set on the response; navigate into the bootcamp.
      window.location.assign(j.redirect || "/me");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
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
        disabled={status === "starting"}
      >
        {status === "starting" ? "Starting…" : "Start training →"}
      </button>
      <p
        style={{
          color: "var(--mist)",
          fontSize: 12.5,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        No password. Your name and email start your account — and let you pick up
        right where you left off.
      </p>
    </form>
  );
}
