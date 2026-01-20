import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import type { CreateTenantInput, UpdateTenantInput } from "@/lib/validators/tenant";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export const tenantService = {
  async findAll(params: PaginationParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where: { enabled: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tenant.count({ where: { enabled: true } }),
    ]);

    return { tenants, total, page, pageSize };
  },

  async findById(id: number) {
    const tenant = await prisma.tenant.findUnique({
      where: { id, enabled: true },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant", id);
    }

    return tenant;
  },

  async create(data: CreateTenantInput, createdBy?: string) {
    return prisma.tenant.create({
      data: {
        ...data,
        createdBy,
        updatedBy: createdBy,
      },
    });
  },

  async update(id: number, data: UpdateTenantInput, updatedBy?: string) {
    const tenant = await this.findById(id);

    return prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        ...data,
        updatedBy,
      },
    });
  },

  async delete(id: number, deletedBy?: string) {
    const tenant = await this.findById(id);

    // Check if tenant has users
    const userCount = await prisma.user.count({
      where: { tenantId: tenant.id, enabled: true },
    });

    if (userCount > 0) {
      throw new ConflictError(
        `Cannot delete tenant with ${userCount} active user(s). Remove users first.`
      );
    }

    // Soft delete
    return prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        enabled: false,
        updatedBy: deletedBy,
      },
    });
  },
};
