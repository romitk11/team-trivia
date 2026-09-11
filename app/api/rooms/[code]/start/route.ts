import { NextRequest, NextResponse } from "next/server";
import { getQuestionSet, getRoomMeta, updateRoomMeta } from "@/lib/redis";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const meta = await getRoomMeta(code);
  if (!meta) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (meta.status !== "lobby") {
    return NextResponse.json({ error: "Game already started" }, { status: 409 });
  }

  const qset = await getQuestionSet(meta.qsetId);
  const question = qset?.questions[0];
  if (!question) return NextResponse.json({ error: "Question set is empty" }, { status: 400 });

  const now = Date.now();
  await updateRoomMeta(code, {
    status: "question",
    currentQuestionIndex: 0,
    questionStartedAt: now,
    questionEndsAt: now + question.timeLimitSec * 1000,
  });

  return NextResponse.json({ ok: true });
}
