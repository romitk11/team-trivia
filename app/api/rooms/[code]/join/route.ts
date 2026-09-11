import { NextRequest, NextResponse } from "next/server";
import { getPlayers, getRoomMeta, joinRoom } from "@/lib/redis";
import { AVATAR_OPTIONS, isValidAvatar } from "@/lib/avatars";

const MAX_PLAYERS = 15;

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const meta = await getRoomMeta(code);
  if (!meta) return NextResponse.json({ error: "Room not found. Check the code and try again." }, { status: 404 });
  if (meta.status !== "lobby") {
    return NextResponse.json({ error: "This game has already started." }, { status: 409 });
  }

  const { name, avatar } = await req.json();
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const chosenAvatar = isValidAvatar(avatar) ? avatar : AVATAR_OPTIONS[0];

  const existingPlayers = await getPlayers(code);
  if (existingPlayers.length >= MAX_PLAYERS) {
    return NextResponse.json({ error: "This game is full (15 players max)." }, { status: 409 });
  }

  const player = await joinRoom(code, name.trim().slice(0, 24), chosenAvatar);
  return NextResponse.json({ player });
}
