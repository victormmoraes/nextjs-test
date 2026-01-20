import { NextRequest } from "next/server";
import { roleService } from "@/services/role.service";
import { updateRoleSchema } from "@/lib/validators/role";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, handleError } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async () => {
    try {
      const { id } = await params;
      const role = await roleService.findById(parseInt(id));
      return successResponse(role);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { id } = await params;
        const body = await request.json();
        const data = updateRoleSchema.parse(body);

        const role = await roleService.update(parseInt(id), data);

        return successResponse(role);
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
        await roleService.delete(parseInt(id));

        return successResponse({ message: "Role deleted successfully" });
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
