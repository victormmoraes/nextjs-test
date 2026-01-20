import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, handleError } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const me = await authService.getMe(user.userId);
      return successResponse(me);
    } catch (error) {
      return handleError(error);
    }
  });
}
