import { NextRequest } from "next/server";
import { roleService } from "@/services/role.service";
import { createRoleSchema } from "@/lib/validators/role";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, handleError } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const roles = await roleService.findAll();
      return successResponse(roles);
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
        const data = createRoleSchema.parse(body);

        const role = await roleService.create(data);

        return successResponse(role, 201);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
