import { NextRequest } from "next/server";
import { tenantService } from "@/services/tenant.service";
import { createTenantSchema } from "@/lib/validators/tenant";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, paginatedResponse, handleError } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "20");

      const result = await tenantService.findAll({ page, pageSize });

      return paginatedResponse(result.tenants, result.total, result.page, result.pageSize);
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
        const data = createTenantSchema.parse(body);

        const tenant = await tenantService.create(data, user.email);

        return successResponse(tenant, 201);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
