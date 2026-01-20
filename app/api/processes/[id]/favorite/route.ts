import { NextRequest } from "next/server";
import { processService } from "@/services/process.service";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, handleError, errorResponse } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      // Check tenant access
      const existing = await processService.findById(id);
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && existing.tenantId !== user.tenantId) {
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
