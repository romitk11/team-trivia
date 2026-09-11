import { NextRequest, NextResponse } from "next/server";
import { createRoom, getQuestionSet } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const ownerId = req.headers.get("x-host-username")!;
  const { qsetId } = await req.json();
  const qset = await getQuestionSet(qsetId);
  if (!qset || qset.ownerId !== ownerId) {
    return NextResponse.json({ error: "Question set not found" }, { status: 404 });
  }
  if (qset.questions.length === 0) {
    return NextResponse.json({ error: "Question set has no questions" }, { status: 400 });
  }
  const code = await createRoom(qsetId);
  return NextResponse.json({ code });
}
