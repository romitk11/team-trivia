import { NextRequest, NextResponse } from "next/server";
import { HOST_SESSION_COOKIE, verifyHostSessionToken } from "@/lib/auth";

const ROOM_HOST_ACTION = /^\/api\/rooms\/[^/]+\/(start|reveal|next|end)$/;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isHostPage = pathname.startsWith("/host") && pathname !== "/host/login";
  const isQsetApi = pathname.startsWith("/api/qsets");
  const isCreateRoomApi = pathname === "/api/rooms" && req.method === "POST";
  const isRoomHostAction = ROOM_HOST_ACTION.test(pathname);

  const needsHostAuth = isHostPage || isQsetApi || isCreateRoomApi || isRoomHostAction;
  if (!needsHostAuth) return NextResponse.next();

  const token = req.cookies.get(HOST_SESSION_COOKIE)?.value;
  const isValid = await verifyHostSessionToken(token);
  if (isValid) return NextResponse.next();

  if (isHostPage) {
    return NextResponse.redirect(new URL("/host/login", req.url));
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/host/:path*", "/api/qsets/:path*", "/api/rooms", "/api/rooms/:path*"],
};
