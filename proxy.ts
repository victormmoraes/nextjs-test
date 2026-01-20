import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Paths that don't require JWT authentication
const publicApiPaths = [
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/docs", // Uses basic auth instead
];

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle API routes - JWT authentication
  if (path.startsWith("/api")) {
    // Skip auth for public API paths
    if (publicApiPaths.some((p) => path.startsWith(p))) {
      return NextResponse.next();
    }

    // Verify JWT for protected API routes
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const payload = verifyToken(token);

      // Add user context to headers for route handlers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId.toString());
      requestHeaders.set("x-tenant-id", payload.tenantId.toString());
      requestHeaders.set("x-user-email", payload.email);
      requestHeaders.set("x-user-roles", payload.roles.join(","));

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
  }

  // Handle non-API routes - i18n locale detection
  // Skip static files and Next.js internals
  if (path.includes(".") || path.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Apply i18n middleware for page routes
  // For localePrefix: 'never', we need to pass through without rewriting
  // return intlMiddleware(request);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
