import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-host-username");
  return NextResponse.json({ username });
}
