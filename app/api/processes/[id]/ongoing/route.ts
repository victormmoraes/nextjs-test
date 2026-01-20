import { NextRequest } from "next/server";
import { ongoingService } from "@/services/ongoing.service";
import { processService } from "@/services/process.service";
import { createOnGoingSchema } from "@/lib/validators/ongoing";
import { withAuth, hasTenantAccess } from "@/lib/auth/middleware";
import { successResponse, paginatedResponse, handleError, errorResponse } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "50");

      const process = await processService.findById(id);
      if (!hasTenantAccess(user, process.tenantId)) {
        return errorResponse("Access denied to this process", 403);
      }

      const result = await ongoingService.findByProcessId(id, { page, pageSize });

      return paginatedResponse(result.items, result.total, result.page, result.pageSize);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      const process = await processService.findById(id);
      if (!hasTenantAccess(user, process.tenantId)) {
        return errorResponse("Access denied to this process", 403);
      }

      const body = await request.json();
      const data = createOnGoingSchema.parse({ ...body, processId: id });

      const item = await ongoingService.create(data, user.email);

      return successResponse(item, 201);
    } catch (error) {
      return handleError(error);
    }
  });
}
