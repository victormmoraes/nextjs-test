import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { refreshTokenSchema } from "@/lib/validators/auth";
import { successResponse, handleError } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = refreshTokenSchema.parse(body);

    await authService.logout(refreshToken);

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    return handleError(error);
  }
}
