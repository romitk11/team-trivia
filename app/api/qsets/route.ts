import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { listQuestionSets, saveQuestionSet } from "@/lib/redis";
import type { QuestionSet } from "@/lib/types";

export async function GET(req: NextRequest) {
  const ownerId = req.headers.get("x-host-username")!;
  const sets = await listQuestionSets(ownerId);
  return NextResponse.json({ questionSets: sets });
}

export async function POST(req: NextRequest) {
  const ownerId = req.headers.get("x-host-username")!;
  const body = await req.json();
  const now = Date.now();
  const qset: QuestionSet = {
    id: nanoid(10),
    ownerId,
    title: body.title || "Untitled Set",
    description: body.description || "",
    announcement: body.announcement || "",
    questions: body.questions || [],
    createdAt: now,
    updatedAt: now,
  };
  await saveQuestionSet(qset);
  return NextResponse.json({ questionSet: qset }, { status: 201 });
}
