import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/games/new", "/games/mine", "/my-list", "/settings", "/first-time"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get("session_id");
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/games/new", "/games/mine/:path*", "/my-list", "/settings", "/first-time"],
};
