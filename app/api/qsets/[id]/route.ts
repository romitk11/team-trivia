import { NextRequest, NextResponse } from "next/server";
import { deleteQuestionSet, getQuestionSet, saveQuestionSet } from "@/lib/redis";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qset = await getQuestionSet(id);
  if (!qset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ questionSet: qset });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getQuestionSet(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = {
    ...existing,
    title: body.title ?? existing.title,
    description: body.description ?? existing.description,
    announcement: body.announcement ?? existing.announcement,
    questions: body.questions ?? existing.questions,
    updatedAt: Date.now(),
  };
  await saveQuestionSet(updated);
  return NextResponse.json({ questionSet: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteQuestionSet(id);
  return NextResponse.json({ ok: true });
}
