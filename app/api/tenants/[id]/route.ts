import { NextRequest } from "next/server";
import { tenantService } from "@/services/tenant.service";
import { updateTenantSchema } from "@/lib/validators/tenant";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, handleError } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async () => {
    try {
      const { id } = await params;
      const tenant = await tenantService.findById(parseInt(id));
      return successResponse(tenant);
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
        const data = updateTenantSchema.parse(body);

        const tenant = await tenantService.update(parseInt(id), data, user.email);

        return successResponse(tenant);
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
        await tenantService.delete(parseInt(id), user.email);

        return successResponse({ message: "Tenant deleted successfully" });
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
