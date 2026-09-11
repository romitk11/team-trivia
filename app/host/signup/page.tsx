"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HostSignupPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/host/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode, username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Couldn't create account");
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
        <h1 className="mb-1 font-display text-2xl font-bold text-ink">Create Host Account</h1>
        <p className="mb-6 text-sm text-ink/60">
          You'll need the invite code to sign up. Your question sets are private to you.
        </p>
        <input
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Invite code"
          autoFocus
          className="mb-3 w-full rounded-xl border-2 border-surface px-4 py-3 text-lg text-ink outline-none transition-colors focus:border-brand-blue"
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          className="mb-3 w-full rounded-xl border-2 border-surface px-4 py-3 text-lg text-ink outline-none transition-colors focus:border-brand-blue"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password (min 8 characters)"
          className="mb-3 w-full rounded-xl border-2 border-surface px-4 py-3 text-lg text-ink outline-none transition-colors focus:border-brand-blue"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="mb-4 w-full rounded-xl border-2 border-surface px-4 py-3 text-lg text-ink outline-none transition-colors focus:border-brand-blue"
        />
        {error && <p className="mb-4 text-sm font-semibold text-answer-red">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !inviteCode || !username || !password || !confirmPassword}
          className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-hover px-4 py-3.5 text-lg font-bold text-white shadow-lg shadow-brand-blue/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create Account"}
        </button>
        <p className="mt-4 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/host/login" className="font-semibold text-brand-blue hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
