import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createHostSessionToken, HOST_SESSION_COOKIE, hashPassword, timingSafeEqual } from "@/lib/auth";
import { createHostAccount, getHostAccount, saveQuestionSet } from "@/lib/redis";
import { buildLaunchSet } from "@/lib/seed-questions";

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

export async function POST(req: NextRequest) {
  const { inviteCode, username, password } = await req.json().catch(() => ({}));
  const expectedInvite = process.env.HOST_PASSCODE ?? "";

  if (!expectedInvite || typeof inviteCode !== "string" || !timingSafeEqual(inviteCode, expectedInvite)) {
    return NextResponse.json({ error: "Incorrect invite code" }, { status: 401 });
  }

  if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-20 characters: letters, numbers, _ or -" },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const ownerId = username.trim().toLowerCase();
  const existing = await getHostAccount(ownerId);
  if (existing) {
    return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
  }

  const { hash, salt } = hashPassword(password);
  await createHostAccount({
    username: username.trim(),
    ownerId,
    passwordHash: hash,
    salt,
    createdAt: Date.now(),
  });

  await saveQuestionSet(buildLaunchSet(nanoid(10), ownerId));

  const token = await createHostSessionToken(ownerId);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HOST_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
