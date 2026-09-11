"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useRoomState } from "@/app/hooks/useRoomState";
import { useRankHistory } from "@/app/hooks/useRankHistory";
import AnswerButton from "@/app/components/AnswerButton";
import Countdown from "@/app/components/Countdown";
import Leaderboard from "@/app/components/Leaderboard";
import Podium from "@/app/components/Podium";
import Confetti from "@/app/components/Confetti";

export default function HostGamePage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const { data, error } = useRoomState(code);
  const [origin, setOrigin] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Called unconditionally (rules of hooks) even before `data` loads.
  const previousRanks = useRankHistory(
    data?.players ?? [],
    data?.status === "results",
    `${data?.status}-${data?.currentQuestionIndex}`,
  );

  async function postAction(action: "start" | "reveal" | "next" | "end") {
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/rooms/${code}/${action}`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Couldn't ${action}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="stage flex flex-1 items-center justify-center">
        <CenteredMessage>{error}</CenteredMessage>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="stage flex flex-1 items-center justify-center">
        <CenteredMessage>Loading…</CenteredMessage>
      </div>
    );
  }

  const isLastQuestion = data.currentQuestionIndex >= data.totalQuestions - 1;
  const progressPct = data.totalQuestions
    ? Math.round(((data.currentQuestionIndex + 1) / data.totalQuestions) * 100)
    : 0;

  return (
    <div className="stage flex flex-1 flex-col items-center px-6 py-10 text-white">
      {data.status === "ended" && <Confetti pieces={90} />}
      <p className="mb-6 font-display text-sm font-semibold uppercase tracking-widest text-surface">
        {data.qsetTitle}
      </p>

      {data.status === "lobby" && (
        <div className="flex w-full max-w-3xl flex-col items-center">
          {data.qsetAnnouncement && (
            <div className="animate-pop-in mb-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 text-center font-display text-lg font-bold text-amber-950 shadow-lg shadow-amber-500/30">
              {data.qsetAnnouncement}
            </div>
          )}
          <div className="card-glow animate-pop-in mb-6 flex flex-col items-center gap-4 rounded-3xl bg-white p-8 sm:flex-row sm:gap-8">
            {origin && <QRCodeSVG value={`${origin}/join?code=${code}`} size={180} />}
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-ink/60">Join at {origin.replace(/^https?:\/\//, "")}/join</p>
              <p className="mt-1 font-display text-5xl font-bold tracking-widest text-brand-blue">{code}</p>
            </div>
          </div>

          <h2 className="mb-3 font-display text-lg font-bold">Players ({data.players.length}/15)</h2>
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {data.players.map((p, i) => (
              <span
                key={p.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-pop-in flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-lg backdrop-blur"
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
              </span>
            ))}
            {data.players.length === 0 && (
              <p className="flex items-center gap-2 text-surface">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-brand-blue"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
                Waiting for players to join…
              </p>
            )}
          </div>

          <button
            onClick={() => postAction("start")}
            disabled={busy || data.players.length === 0}
            className="rounded-2xl bg-gradient-to-r from-answer-green to-emerald-600 px-10 py-4 text-xl font-bold text-white shadow-xl shadow-answer-green/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 disabled:opacity-50"
          >
            Start Game
          </button>
        </div>
      )}

      {data.status === "question" && data.question && (
        <div className="w-full max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-surface">
              Question {data.currentQuestionIndex + 1} / {data.totalQuestions} · {data.answeredCount}/
              {data.players.length} answered
            </p>
            <Countdown
              questionEndsAt={data.questionEndsAt!}
              serverNow={data.serverNow}
              totalSeconds={data.question.timeLimitSec}
            />
          </div>
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-blue to-answer-green transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <h2 className="animate-fade-in-up mb-4 text-center font-display text-2xl font-bold">
            {data.question.prompt}
          </h2>
          {data.question.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.question.imageUrl}
              alt=""
              className="animate-fade-in-up mx-auto mb-6 max-h-64 rounded-2xl border border-white/10 object-contain shadow-lg"
            />
          )}
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.question.options.map((opt, i) => (
              <AnswerButton key={opt.id} index={i} text={opt.text} disabled />
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => postAction("reveal")}
              disabled={busy}
              className="rounded-2xl bg-gradient-to-r from-brand-blue to-brand-blue-hover px-10 py-3.5 text-lg font-bold text-white shadow-xl shadow-brand-blue/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 disabled:opacity-50"
            >
              Reveal Answer
            </button>
          </div>
        </div>
      )}

      {data.status === "results" && data.question && (
        <div className="w-full max-w-2xl">
          <h2 className="animate-fade-in-up mb-6 text-center font-display text-2xl font-bold">
            {data.question.prompt}
          </h2>
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.question.options.map((opt, i) => (
              <AnswerButton
                key={opt.id}
                index={i}
                text={opt.text}
                disabled
                selected={opt.id === data.question!.correctOptionId}
                dimmed={opt.id !== data.question!.correctOptionId}
              />
            ))}
          </div>
          <div className="mx-auto mb-8 max-w-md">
            <Leaderboard players={data.players} title="Standings" previousRanks={previousRanks} />
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => postAction("next")}
              disabled={busy}
              className="rounded-2xl bg-gradient-to-r from-answer-green to-emerald-600 px-10 py-3.5 text-lg font-bold text-white shadow-xl shadow-answer-green/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 disabled:opacity-50"
            >
              {isLastQuestion ? "Finish Game" : "Next Question"}
            </button>
          </div>
        </div>
      )}

      {data.status === "ended" && (
        <div className="w-full max-w-md text-center">
          <h2 className="animate-fade-in-up mb-6 font-display text-3xl font-bold">Final Standings 🏆</h2>
          <Podium players={data.players} />
          <Leaderboard players={data.players} title="Final Standings" />
          <button
            onClick={() => router.push("/host/dashboard")}
            className="mt-8 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-blue-hover px-8 py-3.5 text-lg font-bold text-white shadow-xl shadow-brand-blue/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {actionError && <p className="mt-4 font-semibold text-answer-red">{actionError}</p>}
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return <div className="text-center text-lg text-surface">{children}</div>;
}
