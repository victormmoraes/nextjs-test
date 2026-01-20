import { NextRequest } from "next/server";
import { processService } from "@/services/process.service";
import { addInterestedPartySchema } from "@/lib/validators/process";
import { withAuth, hasTenantAccess } from "@/lib/auth/middleware";
import { successResponse, handleError, errorResponse } from "@/lib/utils/response";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      const existing = await processService.findById(id);
      if (!hasTenantAccess(user, existing.tenantId)) {
        return errorResponse("Access denied to this process", 403);
      }

      const body = await request.json();
      const { party } = addInterestedPartySchema.parse(body);

      const process = await processService.addInterestedParty(id, party, user.email);

      return successResponse({
        id: process.id,
        interestedParties: process.interestedParties,
        message: `Party '${party}' added successfully`,
      }, 201);
    } catch (error) {
      return handleError(error);
    }
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return withAuth(request, async (user) => {
    try {
      const { id } = await params;

      const existing = await processService.findById(id);
      if (!hasTenantAccess(user, existing.tenantId)) {
        return errorResponse("Access denied to this process", 403);
      }

      const body = await request.json();
      const { party } = addInterestedPartySchema.parse(body);

      const process = await processService.removeInterestedParty(id, party, user.email);

      return successResponse({
        id: process.id,
        interestedParties: process.interestedParties,
        message: `Party '${party}' removed successfully`,
      });
    } catch (error) {
      return handleError(error);
    }
  });
}
