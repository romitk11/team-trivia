import { NextRequest, NextResponse } from "next/server";
import { createHostSessionToken, HOST_SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { getHostAccount } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const ownerId = username.trim().toLowerCase();
  const account = await getHostAccount(ownerId);
  if (!account || !verifyPassword(password, account.passwordHash, account.salt)) {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }

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
