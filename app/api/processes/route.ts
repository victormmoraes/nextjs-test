import { NextRequest } from "next/server";
import { processService } from "@/services/process.service";
import { createProcessSchema } from "@/lib/validators/process";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, paginatedResponse, handleError } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "20");
      const search = searchParams.get("search") || undefined;
      const classificationId = searchParams.get("classificationId");
      const isFavorite = searchParams.get("isFavorite");

      // Filter by user's tenant unless admin
      const isAdmin = user.roles.includes("ADMIN");
      const tenantId = isAdmin ? undefined : user.tenantId;

      const result = await processService.findAll({
        tenantId,
        page,
        pageSize,
        search,
        classificationId: classificationId ? parseInt(classificationId) : undefined,
        isFavorite: isFavorite ? isFavorite === "true" : undefined,
      });

      return paginatedResponse(result.processes, result.total, result.page, result.pageSize);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const data = createProcessSchema.parse(body);

      // Default to user's tenant if not provided
      const processData = {
        ...data,
        tenantId: data.tenantId ?? user.tenantId,
      };

      const process = await processService.create(processData, user.email);

      return successResponse(process, 201);
    } catch (error) {
      return handleError(error);
    }
  });
}
