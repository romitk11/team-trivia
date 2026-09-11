import { NextRequest, NextResponse } from "next/server";
import { getAnswers, getPlayers, getQuestionSet, getRoomMeta } from "@/lib/redis";
import type { RoomStateResponse } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const meta = await getRoomMeta(code);
  if (!meta) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const qset = await getQuestionSet(meta.qsetId);
  if (!qset) return NextResponse.json({ error: "Question set not found" }, { status: 404 });

  const players = await getPlayers(code);

  const currentQuestion =
    meta.currentQuestionIndex >= 0 && meta.currentQuestionIndex < qset.questions.length
      ? qset.questions[meta.currentQuestionIndex]
      : null;

  const revealAnswer = meta.status === "results" || meta.status === "ended";
  const answers = currentQuestion ? await getAnswers(code, meta.currentQuestionIndex) : [];

  const response: RoomStateResponse = {
    code,
    status: meta.status,
    qsetTitle: qset.title,
    qsetAnnouncement: qset.announcement,
    totalQuestions: qset.questions.length,
    currentQuestionIndex: meta.currentQuestionIndex,
    question: currentQuestion
      ? {
          id: currentQuestion.id,
          prompt: currentQuestion.prompt,
          imageUrl: currentQuestion.imageUrl,
          options: currentQuestion.options,
          timeLimitSec: currentQuestion.timeLimitSec,
          correctOptionId: revealAnswer ? currentQuestion.correctOptionId : null,
        }
      : null,
    questionStartedAt: meta.questionStartedAt,
    questionEndsAt: meta.questionEndsAt,
    answeredCount: answers.length,
    players,
    serverNow: Date.now(),
  };

  return NextResponse.json(response);
}
