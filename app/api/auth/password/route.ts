import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { changePasswordSchema } from "@/lib/validators/user";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, handleError } from "@/lib/utils/response";

export async function PUT(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { currentPassword, newPassword } = changePasswordSchema.parse(body);

      await authService.changePassword(user.userId, currentPassword, newPassword);

      return successResponse({ message: "Password changed successfully" });
    } catch (error) {
      return handleError(error);
    }
  });
}
