import { NextRequest, NextResponse } from "next/server";
import { getRoomMeta, updateRoomMeta } from "@/lib/redis";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const meta = await getRoomMeta(code);
  if (!meta) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  await updateRoomMeta(code, { status: "ended" });
  return NextResponse.json({ ok: true });
}
