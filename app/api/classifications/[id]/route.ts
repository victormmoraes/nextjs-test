import { NextRequest } from "next/server";
import { classificationService } from "@/services/classification.service";
import { updateClassificationSchema } from "@/lib/validators/classification";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, handleError } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async () => {
    try {
      const { id } = await params;
      const classification = await classificationService.findById(parseInt(id));
      return successResponse(classification);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { id } = await params;
        const body = await request.json();
        const data = updateClassificationSchema.parse(body);

        const classification = await classificationService.update(
          parseInt(id),
          data,
          user.email
        );

        return successResponse(classification);
      } catch (error) {
        return handleError(error);
      }
    });
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { id } = await params;
        await classificationService.delete(parseInt(id), user.email);

        return successResponse({ message: "Classification deleted successfully" });
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
