import { NextRequest, NextResponse } from "next/server";
import { createHostSessionToken, HOST_SESSION_COOKIE, timingSafeEqual } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { passcode } = await req.json().catch(() => ({ passcode: "" }));
  const expected = process.env.HOST_PASSCODE ?? "";

  if (!expected || typeof passcode !== "string" || !timingSafeEqual(passcode, expected)) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  const token = await createHostSessionToken();
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
