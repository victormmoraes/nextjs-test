import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  errors?: Record<string, string[]>
): NextResponse<ErrorResponse> {
  return NextResponse.json({ success: false, error: message, code, errors }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export function handleError(error: unknown): NextResponse<ErrorResponse> {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    });
    return errorResponse("Validation failed", 400, "VALIDATION_ERROR", errors);
  }

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode, error.code);
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error";
    return errorResponse(message, 500, "INTERNAL_ERROR");
  }

  return errorResponse("An unexpected error occurred", 500, "UNKNOWN_ERROR");
}
