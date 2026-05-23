// ============================================================
// Firstframe V1 — Next.js Middleware (Supabase)
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- Admin Routes ----
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Update Supabase session (refresh tokens if needed) for protected admin paths
    const { response, user } = await updateSession(request);

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  // ---- Brand Routes ----
  if (pathname.startsWith("/brand") && pathname !== "/brand/login") {
    const brandSession = request.cookies.get("firstframe_brand_session")?.value;
    if (!brandSession) {
      return NextResponse.redirect(new URL("/brand/login", request.url));
    }
    return NextResponse.next();
  }

  // ---- Creator Routes ----
  if (pathname.startsWith("/creator") && pathname !== "/creator/join") {
    const creatorSession = request.cookies.get("firstframe_creator_session")?.value;
    if (!creatorSession) {
      return NextResponse.redirect(new URL("/creator/join", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/brand/:path*",
    "/creator/:path*",
  ],
};
