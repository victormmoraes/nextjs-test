import { NextRequest } from "next/server";
import { classificationService } from "@/services/classification.service";
import { createClassificationSchema } from "@/lib/validators/classification";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, paginatedResponse, handleError } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "50");
      const category = searchParams.get("category") || undefined;

      const result = await classificationService.findAll({ page, pageSize, category });

      return paginatedResponse(
        result.classifications,
        result.total,
        result.page,
        result.pageSize
      );
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
        const data = createClassificationSchema.parse(body);

        const classification = await classificationService.create(data, user.email);

        return successResponse(classification, 201);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
