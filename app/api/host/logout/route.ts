import { NextResponse } from "next/server";
import { HOST_SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(HOST_SESSION_COOKIE);
  return res;
}
