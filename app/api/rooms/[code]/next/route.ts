import { NextRequest, NextResponse } from "next/server";
import { getQuestionSet, getRoomMeta, updateRoomMeta } from "@/lib/redis";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const meta = await getRoomMeta(code);
  if (!meta) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (meta.status !== "results") {
    return NextResponse.json({ error: "Reveal the current question before advancing" }, { status: 409 });
  }

  const qset = await getQuestionSet(meta.qsetId);
  const nextIndex = meta.currentQuestionIndex + 1;
  const nextQuestion = qset?.questions[nextIndex];

  if (!nextQuestion) {
    await updateRoomMeta(code, { status: "ended" });
    return NextResponse.json({ ok: true, ended: true });
  }

  const now = Date.now();
  await updateRoomMeta(code, {
    status: "question",
    currentQuestionIndex: nextIndex,
    questionStartedAt: now,
    questionEndsAt: now + nextQuestion.timeLimitSec * 1000,
  });

  return NextResponse.json({ ok: true, ended: false });
}
