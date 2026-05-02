import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute";
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // ❌ SKIP: API routes, Next internal files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  try {
    const hasToken = request.cookies.has("access_token");

    if (!hasToken) {
      if (!pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl));
      }
      return NextResponse.next();
    }

    const token = request.cookies.get("access_token").value;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SECRET_KEY)
    );

    const role = payload.role;

    if (pathname.startsWith("/auth")) {
      return NextResponse.redirect(
        new URL(
          role === "admin" ? ADMIN_DASHBOARD : USER_DASHBOARD,
          request.nextUrl
        )
      );
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl));
    }

    if (pathname.startsWith("/my-account") && role !== "user") {
      return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl));
  }
}


export const config = {
  matcher: [
    "/admin/:path*",
    "/my-account/:path*",
    "/auth/:path*"
  ]
};
