import { NextRequest } from "next/server";
import { processService } from "@/services/process.service";
import { withAuth, hasTenantAccess } from "@/lib/auth/middleware";
import { successResponse, handleError, errorResponse } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      const existing = await processService.findById(id);
      if (!hasTenantAccess(user, existing.tenantId)) {
        return errorResponse("Access denied to this process", 403);
      }

      const process = await processService.toggleFavorite(id, user.email);

      return successResponse({
        id: process.id,
        isFavorite: process.isFavorite,
        message: process.isFavorite ? "Added to favorites" : "Removed from favorites",
      });
    } catch (error) {
      return handleError(error);
    }
  });
}
