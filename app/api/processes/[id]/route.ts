import { NextRequest } from "next/server";
import { processService } from "@/services/process.service";
import { updateProcessSchema } from "@/lib/validators/process";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, handleError, errorResponse } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;
      const process = await processService.findById(id);

      // Check tenant access
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && process.tenantId !== user.tenantId) {
        return errorResponse("Access denied to this process", 403);
      }

      return successResponse(process);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = updateProcessSchema.parse(body);

      // Check tenant access
      const existing = await processService.findById(id);
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && existing.tenantId !== user.tenantId) {
        return errorResponse("Access denied to this process", 403);
      }

      const process = await processService.update(id, data, user.email);

      return successResponse(process);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      // Check tenant access
      const existing = await processService.findById(id);
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && existing.tenantId !== user.tenantId) {
        return errorResponse("Access denied to this process", 403);
      }

      await processService.delete(id, user.email);

      return successResponse({ message: "Process deleted successfully" });
    } catch (error) {
      return handleError(error);
    }
  });
}
