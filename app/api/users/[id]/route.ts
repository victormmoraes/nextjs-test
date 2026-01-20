import { NextRequest } from "next/server";
import { userService } from "@/services/user.service";
import { updateUserSchema } from "@/lib/validators/user";
import { withAuth, requireRole } from "@/lib/auth/middleware";
import { successResponse, handleError, errorResponse } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;
      const userId = parseInt(id);

      // Users can view their own profile or admins can view any
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && user.userId !== userId) {
        return errorResponse("You can only view your own profile", 403);
      }

      const foundUser = await userService.findById(userId);
      return successResponse(foundUser);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;
      const userId = parseInt(id);

      // Users can update their own profile, admins can update any
      const isAdmin = user.roles.includes("ADMIN");
      if (!isAdmin && user.userId !== userId) {
        return errorResponse("You can only update your own profile", 403);
      }

      const body = await request.json();
      const data = updateUserSchema.parse(body);

      // Non-admins cannot change their own tenant
      if (!isAdmin && data.tenantId) {
        return errorResponse("You cannot change your tenant", 403);
      }

      const updatedUser = await userService.update(userId, data, user.email);

      return successResponse(updatedUser);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    return requireRole(user, "ADMIN", async () => {
      try {
        const { id } = await params;
        const userId = parseInt(id);

        // Prevent self-deletion
        if (user.userId === userId) {
          return errorResponse("You cannot delete your own account", 400);
        }

        await userService.delete(userId, user.email);

        return successResponse({ message: "User deleted successfully" });
      } catch (error) {
        return handleError(error);
      }
    });
  });
}
