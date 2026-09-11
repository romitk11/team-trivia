"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AVATAR_OPTIONS } from "@/lib/avatars";
import { savePlayerSession } from "@/lib/playerSession";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code")?.toUpperCase() ?? "");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    if (!trimmedCode || !trimmedName) {
      setError("Enter both a room code and your name.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${trimmedCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, avatar }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't join that game.");

      savePlayerSession(trimmedCode, { playerId: body.player.id, name: trimmedName, avatar });
      router.push(`/play/${trimmedCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-glow animate-pop-in w-full max-w-md rounded-3xl bg-white p-8"
    >
      <h1 className="mb-6 text-center font-display text-3xl font-bold text-ink">Join a Game</h1>

      <label className="mb-1 block text-sm font-semibold text-ink/70">Room code</label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ABC123"
        maxLength={6}
        autoFocus={!code}
        className="mb-4 w-full rounded-xl border-2 border-surface px-4 py-3 text-center font-display text-2xl font-bold tracking-[0.3em] uppercase text-brand-blue outline-none transition-colors focus:border-brand-blue"
      />

      <label className="mb-1 block text-sm font-semibold text-ink/70">Your name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="What should we call you?"
        maxLength={24}
        autoFocus={!!code}
        className="mb-4 w-full rounded-xl border-2 border-surface px-4 py-3 text-lg text-ink outline-none transition-colors focus:border-brand-blue"
      />

      <label className="mb-2 block text-sm font-semibold text-ink/70">Pick a character</label>
      <div className="mb-6 grid grid-cols-6 gap-2">
        {AVATAR_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setAvatar(option)}
            className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition-all duration-150 ${
              avatar === option
                ? "scale-110 bg-brand-blue-light shadow-md ring-2 ring-brand-blue"
                : "bg-marble hover:-translate-y-0.5 hover:bg-surface"
            }`}
            aria-pressed={avatar === option}
          >
            {option}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm font-semibold text-answer-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-hover px-4 py-3.5 text-lg font-bold text-white shadow-lg shadow-brand-blue/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
      >
        {submitting ? "Joining…" : "Join Game"}
      </button>
    </form>
  );
}

export default function JoinPage() {
  return (
    <div className="stage flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Suspense fallback={null}>
        <JoinForm />
      </Suspense>
    </div>
  );
}
