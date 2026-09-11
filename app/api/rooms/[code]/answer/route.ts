import { NextRequest, NextResponse } from "next/server";
import { getQuestionSet, getRoomMeta, submitAnswer } from "@/lib/redis";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { playerId, optionId } = await req.json();

  if (typeof playerId !== "string" || typeof optionId !== "string") {
    return NextResponse.json({ error: "playerId and optionId are required" }, { status: 400 });
  }

  const meta = await getRoomMeta(code);
  if (!meta) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const qset = await getQuestionSet(meta.qsetId);
  const question = qset?.questions[meta.currentQuestionIndex];
  if (!question) return NextResponse.json({ error: "No active question" }, { status: 409 });

  const result = await submitAnswer(code, meta, question, playerId, optionId, Date.now());

  if (!result.ok) {
    const status = result.reason === "already-answered" ? 409 : 400;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json({ record: result.record });
}
