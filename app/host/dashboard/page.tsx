"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuestionSet } from "@/lib/types";

export default function HostDashboardPage() {
  const router = useRouter();
  const [sets, setSets] = useState<QuestionSet[] | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creatingFrom, setCreatingFrom] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/qsets")
      .then((res) => res.json())
      .then((body) => setSets(body.questionSets))
      .catch(() => setError("Couldn't load question sets."));
    fetch("/api/host/me")
      .then((res) => res.json())
      .then((body) => setUsername(body.username))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/host/logout", { method: "POST" });
    router.push("/host/login");
  }

  async function hostSet(qsetId: string) {
    setCreatingFrom(qsetId);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qsetId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't create room");
      router.push(`/host/game/${body.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCreatingFrom(null);
    }
  }

  return (
    <div className="stage flex-1 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-white">Host Dashboard</h1>
          <Link
            href="/host/sets/new/edit"
            className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-hover px-4 py-2.5 font-bold text-white shadow-lg shadow-brand-blue/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            + New Set
          </Link>
        </div>
        <div className="mb-8 flex items-center justify-between text-sm text-surface">
          <span>{username ? `Logged in as ${username}` : ""}</span>
          <button onClick={handleLogout} className="font-semibold text-surface underline-offset-2 hover:underline">
            Log out
          </button>
        </div>

        {error && <p className="mb-4 font-semibold text-answer-red">{error}</p>}
        {sets === null && <p className="text-surface">Loading…</p>}
        {sets?.length === 0 && <p className="text-surface">No question sets yet. Create one to get started.</p>}

        <ul className="space-y-4">
          {sets?.map((set, i) => (
            <li
              key={set.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="card-glow animate-fade-in-up rounded-2xl bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">{set.title}</h2>
                  <p className="text-sm text-ink/60">{set.questions.length} questions</p>
                  {set.description && <p className="mt-1 text-sm text-ink/70">{set.description}</p>}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => hostSet(set.id)}
                    disabled={creatingFrom !== null || set.questions.length === 0}
                    className="rounded-xl bg-gradient-to-r from-answer-green to-emerald-600 px-4 py-2 font-bold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50"
                  >
                    {creatingFrom === set.id ? "Starting…" : "Host this set"}
                  </button>
                  <Link
                    href={`/host/sets/${set.id}/edit`}
                    className="rounded-xl border-2 border-surface px-4 py-2 text-center font-bold text-ink transition-colors hover:border-brand-blue hover:bg-marble"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
