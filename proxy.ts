import { NextRequest, NextResponse } from "next/server";
import { HOST_SESSION_COOKIE, verifyHostSessionToken } from "@/lib/auth";

const ROOM_HOST_ACTION = /^\/api\/rooms\/[^/]+\/(start|reveal|next|end)$/;
const PUBLIC_HOST_PAGES = ["/host/login", "/host/signup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isHostPage = pathname.startsWith("/host") && !PUBLIC_HOST_PAGES.includes(pathname);
  const isQsetApi = pathname.startsWith("/api/qsets");
  const isMeApi = pathname === "/api/host/me";
  const isCreateRoomApi = pathname === "/api/rooms" && req.method === "POST";
  const isRoomHostAction = ROOM_HOST_ACTION.test(pathname);

  const needsHostAuth = isHostPage || isQsetApi || isMeApi || isCreateRoomApi || isRoomHostAction;
  if (!needsHostAuth) return NextResponse.next();

  const token = req.cookies.get(HOST_SESSION_COOKIE)?.value;
  const session = await verifyHostSessionToken(token);
  if (session) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-host-username", session.username);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isHostPage) {
    return NextResponse.redirect(new URL("/host/login", req.url));
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/host/:path*", "/api/qsets/:path*", "/api/host/me", "/api/rooms", "/api/rooms/:path*"],
};
