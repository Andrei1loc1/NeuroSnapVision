import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, signSession, needsResign } from "@/lib/server/session";

const PUBLIC_PATHS = ["/onboarding", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("neurosnap_session")?.value;
  const userId = token ? await verifySession(token) : null;

  if (!userId && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname.startsWith("/api/") && userId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-ID", userId);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    if (token && needsResign(token)) {
      const signed = await signSession(userId);
      response.cookies.set("neurosnap_session", signed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return response;
  }

  const response = NextResponse.next();

  if (token && userId && needsResign(token)) {
    const signed = await signSession(userId);
    response.cookies.set("neurosnap_session", signed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|sw.js|manifest.json).*)"],
};