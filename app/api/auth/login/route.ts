import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { loginSchema } from "@/lib/validators/auth";
import { successResponse, handleError } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    const result = await authService.login(
      email,
      password,
      ipAddress || undefined,
      userAgent || undefined
    );

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
