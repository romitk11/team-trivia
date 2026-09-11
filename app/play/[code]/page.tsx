"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomState } from "@/app/hooks/useRoomState";
import { useServerCountdown } from "@/app/hooks/useServerCountdown";
import { useRankHistory } from "@/app/hooks/useRankHistory";
import { getPlayerSession, type PlayerSession } from "@/lib/playerSession";
import AnswerButton from "@/app/components/AnswerButton";
import Countdown from "@/app/components/Countdown";
import Leaderboard from "@/app/components/Leaderboard";
import Podium from "@/app/components/Podium";
import Confetti from "@/app/components/Confetti";

export default function PlayPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const { data, error } = useRoomState(code);
  const [session, setSession] = useState<PlayerSession | null | undefined>(undefined);

  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Called unconditionally (rules of hooks) even before `data` loads; harmless fallback values.
  const secondsLeft = useServerCountdown(data?.questionEndsAt ?? Date.now(), data?.serverNow ?? Date.now());
  const previousRanks = useRankHistory(
    data?.players ?? [],
    data?.status === "results" || data?.status === "ended",
    `${data?.status}-${data?.currentQuestionIndex}`,
  );

  useEffect(() => {
    const s = getPlayerSession(code);
    setSession(s);
    if (!s) router.replace(`/join?code=${code}`);
  }, [code, router]);

  // Reset per-question answer state whenever the active question changes.
  useEffect(() => {
    if (data?.currentQuestionIndex !== answeredIndex) {
      setChosenOptionId(null);
      setPointsAwarded(null);
      setAnswerError(null);
      setSubmitting(false);
    }
  }, [data?.currentQuestionIndex, answeredIndex]);

  if (session === undefined || !data) {
    return (
      <div className="stage flex flex-1 items-center justify-center">
        <CenteredMessage>Loading…</CenteredMessage>
      </div>
    );
  }
  if (error) {
    return (
      <div className="stage flex flex-1 items-center justify-center">
        <CenteredMessage>{error}</CenteredMessage>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="stage flex flex-1 items-center justify-center">
        <CenteredMessage>Redirecting to join…</CenteredMessage>
      </div>
    );
  }

  async function submitAnswer(optionId: string) {
    if (!session || submitting) return;
    setSubmitting(true);
    setAnswerError(null);
    try {
      const res = await fetch(`/api/rooms/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: session.playerId, optionId }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(
          body.error === "time-expired" ? "Time's up! Your answer didn't count." : "Couldn't submit answer",
        );
      }
      // Only mark as answered once the server has actually accepted it.
      setChosenOptionId(optionId);
      setAnsweredIndex(data!.currentQuestionIndex);
      setPointsAwarded(body.record.pointsAwarded);
    } catch (err) {
      setAnswerError(err instanceof Error ? err.message : "Couldn't submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  const hasAnsweredCurrent = answeredIndex === data.currentQuestionIndex && chosenOptionId !== null;
  const myScore = data.players.find((p) => p.id === session.playerId)?.score ?? 0;
  const timeIsUp = data.status === "question" && secondsLeft <= 0;
  const iAmCorrect = hasAnsweredCurrent && chosenOptionId === data.question?.correctOptionId;
  const progressPct = data.totalQuestions
    ? Math.round(((data.currentQuestionIndex + 1) / data.totalQuestions) * 100)
    : 0;

  return (
    <div className="stage flex flex-1 flex-col items-center px-4 py-8 text-white">
      {(data.status === "results" && iAmCorrect) || data.status === "ended" ? <Confetti pieces={70} /> : null}

      <div className="mb-6 flex w-full max-w-xl items-center justify-between">
        <span className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm backdrop-blur">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-lg">
            {session.avatar}
          </span>
          <span className="font-semibold text-surface">{session.name}</span>
        </span>
        <span className="animate-pop-in rounded-full bg-gradient-to-r from-brand-blue to-answer-green px-4 py-1.5 font-display font-bold text-white shadow-lg">
          {myScore} pts
        </span>
      </div>

      {data.status === "lobby" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-3 w-3 animate-bounce rounded-full bg-brand-blue"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="font-display text-2xl font-bold text-white">You&apos;re in!</p>
          <p className="mt-2 text-lg text-surface">Waiting for the host to start…</p>
          {data.qsetAnnouncement && (
            <div className="animate-pop-in mt-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 text-center font-display font-bold text-amber-950 shadow-lg shadow-amber-500/30">
              {data.qsetAnnouncement}
            </div>
          )}
        </div>
      )}

      {data.status === "question" && data.question && !hasAnsweredCurrent && (
        <div className="w-full max-w-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-surface">
              Question {data.currentQuestionIndex + 1} / {data.totalQuestions}
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
          <h2 className="animate-fade-in-up mb-4 font-display text-2xl font-bold">{data.question.prompt}</h2>
          {data.question.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.question.imageUrl}
              alt=""
              className="animate-fade-in-up mx-auto mb-6 max-h-56 rounded-2xl border border-white/10 object-contain shadow-lg"
            />
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.question.options.map((opt, i) => (
              <AnswerButton
                key={opt.id}
                index={i}
                text={opt.text}
                disabled={submitting || timeIsUp}
                dimmed={timeIsUp}
                onClick={() => submitAnswer(opt.id)}
              />
            ))}
          </div>
          {timeIsUp && (
            <p className="animate-pop-in mt-4 text-center text-xl font-bold text-answer-orange">
              Time&apos;s up! You can&apos;t answer anymore.
            </p>
          )}
          {!timeIsUp && answerError && (
            <p className="mt-4 font-semibold text-answer-red">{answerError}</p>
          )}
        </div>
      )}

      {data.status === "question" && hasAnsweredCurrent && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-pop-in mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-answer-green text-4xl shadow-xl">
            ✓
          </div>
          <p className="font-display text-2xl font-bold text-white">Answer locked in!</p>
          <p className="mt-2 text-lg text-surface">Waiting for other players…</p>
        </div>
      )}

      {data.status === "results" && data.question && (
        <div className="w-full max-w-md text-center">
          <ResultBanner
            answered={hasAnsweredCurrent}
            correct={chosenOptionId === data.question.correctOptionId}
            points={pointsAwarded}
          />
          <Leaderboard
            players={data.players}
            currentPlayerId={session.playerId}
            title="Standings"
            previousRanks={previousRanks}
          />
        </div>
      )}

      {data.status === "ended" && (
        <div className="w-full max-w-md text-center">
          <h2 className="animate-fade-in-up mb-6 font-display text-3xl font-bold">Game over! 🎉</h2>
          <Podium players={data.players} />
          <Leaderboard players={data.players} currentPlayerId={session.playerId} title="Final Standings" />
        </div>
      )}
    </div>
  );
}

function ResultBanner({
  answered,
  correct,
  points,
}: {
  answered: boolean;
  correct: boolean;
  points: number | null;
}) {
  if (!answered) {
    return (
      <div className="animate-pop-in mb-6">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-answer-orange text-3xl shadow-xl">
          ⏰
        </div>
        <p className="font-display text-xl font-bold text-answer-orange">Time&apos;s up — no answer submitted.</p>
      </div>
    );
  }
  if (correct) {
    return (
      <div className="animate-pop-in mb-6">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-answer-green text-3xl shadow-xl">
          🎉
        </div>
        <p className="font-display text-xl font-bold text-answer-green">Correct! +{points ?? 0} points</p>
      </div>
    );
  }
  return (
    <div className="animate-pop-in mb-6">
      <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-answer-red text-3xl shadow-xl">
        ✗
      </div>
      <p className="font-display text-xl font-bold text-answer-red">Not quite — 0 points</p>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return <div className="text-center text-lg text-surface">{children}</div>;
}
