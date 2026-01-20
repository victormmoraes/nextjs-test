import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type JWTPayload } from "./jwt";
import { errorResponse } from "@/lib/utils/response";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AuthenticatedHandler = (
  user: JWTPayload,
  request: NextRequest
) => Promise<NextResponse<any>>;

export async function withAuth(
  request: NextRequest,
  handler: AuthenticatedHandler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<NextResponse<any>> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse("Authorization header missing or invalid", 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    return handler(payload, request);
  } catch {
    return errorResponse("Invalid or expired token", 401);
  }
}

export async function requireRole(
  user: JWTPayload,
  requiredRole: string | string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: () => Promise<NextResponse<any>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<NextResponse<any>> {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasRole = roles.some((role) => user.roles.includes(role));

  if (!hasRole) {
    return errorResponse(
      `Requires one of the following roles: ${roles.join(", ")}`,
      403
    );
  }

  return handler();
}

export async function requireAnyRole(
  user: JWTPayload,
  requiredRoles: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: () => Promise<NextResponse<any>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<NextResponse<any>> {
  return requireRole(user, requiredRoles, handler);
}

export async function requireAllRoles(
  user: JWTPayload,
  requiredRoles: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: () => Promise<NextResponse<any>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<NextResponse<any>> {
  const hasAllRoles = requiredRoles.every((role) => user.roles.includes(role));

  if (!hasAllRoles) {
    return errorResponse(
      `Requires all of the following roles: ${requiredRoles.join(", ")}`,
      403
    );
  }

  return handler();
}

export function getUserFromHeaders(request: NextRequest): JWTPayload | null {
  const userId = request.headers.get("x-user-id");
  const tenantId = request.headers.get("x-tenant-id");
  const email = request.headers.get("x-user-email");
  const rolesHeader = request.headers.get("x-user-roles");

  if (!userId || !tenantId) {
    return null;
  }

  return {
    userId: parseInt(userId),
    tenantId: parseInt(tenantId),
    email: email || "",
    roles: rolesHeader ? rolesHeader.split(",") : [],
  };
}
