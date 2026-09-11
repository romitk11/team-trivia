import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getQuestionSet, listQuestionSets, saveQuestionSet } from "@/lib/redis";
import { buildLaunchSet, LAUNCH_SET_ID } from "@/lib/seed-questions";
import type { QuestionSet } from "@/lib/types";

export async function GET() {
  let sets = await listQuestionSets();
  if (sets.length === 0 && !(await getQuestionSet(LAUNCH_SET_ID))) {
    await saveQuestionSet(buildLaunchSet());
    sets = await listQuestionSets();
  }
  return NextResponse.json({ questionSets: sets });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = Date.now();
  const qset: QuestionSet = {
    id: nanoid(10),
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
