import { NextRequest } from "next/server";
import { userService } from "@/services/user.service";
import { createUserSchema } from "@/lib/validators/user";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, paginatedResponse, handleError } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "20");
      const search = searchParams.get("search") || undefined;

      // Users can only see users in their own tenant unless they're admin
      const isAdmin = user.roles.includes("ADMIN");
      const tenantId = isAdmin ? undefined : user.tenantId;

      const result = await userService.findAll({ tenantId, page, pageSize, search });

      return paginatedResponse(result.users, result.total, result.page, result.pageSize);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const body = await request.json();
        const data = createUserSchema.parse(body);

        const newUser = await userService.create(data, user.email);

        return successResponse(newUser, 201);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
