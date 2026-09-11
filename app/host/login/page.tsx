"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HostLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/host/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Incorrect passcode");
      }
      router.push("/host/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stage flex flex-1 flex-col items-center justify-center px-6 py-16">
      <form onSubmit={handleSubmit} className="card-glow animate-pop-in w-full max-w-sm rounded-3xl bg-white p-8">
        <h1 className="mb-1 font-display text-2xl font-bold text-ink">Host Login</h1>
        <p className="mb-6 text-sm text-ink/60">Enter the host passcode to create and run games.</p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          autoFocus
          className="mb-4 w-full rounded-xl border-2 border-surface px-4 py-3 text-lg text-ink outline-none transition-colors focus:border-brand-blue"
        />
        {error && <p className="mb-4 text-sm font-semibold text-answer-red">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !passcode}
          className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-hover px-4 py-3.5 text-lg font-bold text-white shadow-lg shadow-brand-blue/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
        >
          {submitting ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
