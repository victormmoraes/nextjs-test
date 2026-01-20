import { NextRequest } from "next/server";
import { loggingService } from "@/services/logging.service";
import { updateBotLogSchema } from "@/lib/validators/logging";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, paginatedResponse, handleError } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "30");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const result = await loggingService.findBotLogs({
          page,
          pageSize,
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
    return requireRole(user, "ADMIN", async () => {
      try {
        const body = await request.json();
        const { numberOfUpdates } = updateBotLogSchema.parse(body);

        const log = await loggingService.createBotLog(numberOfUpdates);

        return successResponse(log, 201);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
          // Update today's log
          const body = await request.json();
          const { numberOfUpdates } = updateBotLogSchema.parse(body);

          const todayLog = await loggingService.getOrCreateTodayBotLog();
          const updated = await loggingService.updateBotLog(todayLog.id, numberOfUpdates);

          return successResponse(updated);
        }

        const body = await request.json();
        const { numberOfUpdates } = updateBotLogSchema.parse(body);

        const log = await loggingService.updateBotLog(parseInt(id), numberOfUpdates);

        return successResponse(log);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
