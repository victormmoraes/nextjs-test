import { NextRequest } from "next/server";
import { userService } from "@/services/user.service";
import { assignRoleSchema } from "@/lib/validators/user";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, handleError } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async () => {
    try {
      const { id } = await params;
      const roles = await userService.getUserRoles(parseInt(id));
      return successResponse(roles);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { id } = await params;
        const body = await request.json();
        const { roleId } = assignRoleSchema.parse(body);

        const updatedUser = await userService.assignRole(parseInt(id), roleId);

        return successResponse(updatedUser, 201);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { id } = await params;
        const body = await request.json();
        const { roleId } = assignRoleSchema.parse(body);

        const updatedUser = await userService.removeRole(parseInt(id), roleId);

        return successResponse(updatedUser);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
