import { NextRequest } from "next/server";
import { loggingService } from "@/services/logging.service";
import { createInteractionLogSchema } from "@/lib/validators/logging";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, paginatedResponse, handleError } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "50");
        const userId = searchParams.get("userId");
        const tenantId = searchParams.get("tenantId");
        const interactionType = searchParams.get("interactionType") || undefined;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const result = await loggingService.findInteractionLogs({
          page,
          pageSize,
          userId: userId ? parseInt(userId) : undefined,
          tenantId: tenantId ? parseInt(tenantId) : undefined,
          interactionType,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        });

        return paginatedResponse(result.logs, result.total, result.page, result.pageSize);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const data = createInteractionLogSchema.parse({
        ...body,
        userId: body.userId || user.userId,
        tenantId: body.tenantId || user.tenantId,
      });

      const log = await loggingService.createInteractionLog(data, user.email);

      return successResponse(log, 201);
    } catch (error) {
      return handleError(error);
    }
  });
}
