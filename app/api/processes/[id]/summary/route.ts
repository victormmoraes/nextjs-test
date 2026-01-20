import { NextRequest } from "next/server";
import { summaryService } from "@/services/summary.service";
import { processService } from "@/services/process.service";
import { updateSummarySchema, createSummarySchema } from "@/lib/validators/summary";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, handleError, errorResponse } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      // Check tenant access
      const process = await processService.findById(id);
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && process.tenantId !== user.tenantId) {
        return errorResponse("Access denied to this process", 403);
      }

      const summary = await summaryService.findByProcessId(id);
      return successResponse(summary);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      // Check tenant access
      const process = await processService.findById(id);
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && process.tenantId !== user.tenantId) {
        return errorResponse("Access denied to this process", 403);
      }

      const body = await request.json();
      const data = createSummarySchema.parse({ ...body, processId: id });

      const summary = await summaryService.create(data, user.email);

      return successResponse(summary, 201);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      // Check tenant access
      const process = await processService.findById(id);
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && process.tenantId !== user.tenantId) {
        return errorResponse("Access denied to this process", 403);
      }

      const body = await request.json();
      const data = updateSummarySchema.parse(body);

      const summary = await summaryService.upsert(
        { processId: id, summaryData: data.summaryData || {}, ...data },
        user.email
      );

      return successResponse(summary);
    } catch (error) {
      return handleError(error);
    }
  });
}
