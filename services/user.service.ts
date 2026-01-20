import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validators/user";

export interface UserQueryParams {
  tenantId?: number;
  page?: number;
  pageSize?: number;
  search?: string;
}

export const userService = {
  async findAll(params: UserQueryParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where = {
      enabled: true,
      ...(params.tenantId && { tenantId: params.tenantId }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { email: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          tenant: {
            select: { id: true, name: true },
          },
          roles: {
            include: { role: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const mappedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      tenant: user.tenant,
      roles: user.roles.map((ur) => ur.role.name),
      lastLoggedInAt: user.lastLoggedInAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return { users: mappedUsers, total, page, pageSize };
  },

  async findById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id, enabled: true },
      include: {
        tenant: {
          select: { id: true, name: true },
        },
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User", id);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      tenant: user.tenant,
      roles: user.roles.map((ur) => ur.role.name),
      lastLoggedInAt: user.lastLoggedInAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async create(data: CreateUserInput, createdBy?: string) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError(`User with email '${data.email}' already exists`);
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId, enabled: true },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant", data.tenantId);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        tenantId: data.tenantId,
        createdBy,
        updatedBy: createdBy,
        ...(data.roleIds && {
          roles: {
            create: data.roleIds.map((roleId) => ({ roleId })),
          },
        }),
      },
      include: {
        tenant: {
          select: { id: true, name: true },
        },
        roles: {
          include: { role: true },
        },
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      tenant: user.tenant,
      roles: user.roles.map((ur) => ur.role.name),
      createdAt: user.createdAt,
    };
  },

  async update(id: number, data: UpdateUserInput, updatedBy?: string) {
    const user = await prisma.user.findUnique({
      where: { id, enabled: true },
    });

    if (!user) {
      throw new NotFoundError("User", id);
    }

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new ConflictError(`User with email '${data.email}' already exists`);
      }
    }

    if (data.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId, enabled: true },
      });

      if (!tenant) {
        throw new NotFoundError("Tenant", data.tenantId);
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
      },
      include: {
        tenant: {
          select: { id: true, name: true },
        },
        roles: {
          include: { role: true },
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      tenantId: updated.tenantId,
      tenant: updated.tenant,
      roles: updated.roles.map((ur) => ur.role.name),
      updatedAt: updated.updatedAt,
    };
  },

  async delete(id: number, deletedBy?: string) {
    const user = await prisma.user.findUnique({
      where: { id, enabled: true },
    });

    if (!user) {
      throw new NotFoundError("User", id);
    }

    // Soft delete
    return prisma.user.update({
      where: { id },
      data: {
        enabled: false,
        updatedBy: deletedBy,
      },
    });
  },

  async assignRole(userId: number, roleId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId, enabled: true },
    });

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundError("Role", roleId);
    }

    // Check if already assigned
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    if (existing) {
      throw new ConflictError(`User already has role '${role.name}'`);
    }

    await prisma.userRole.create({
      data: { userId, roleId },
    });

    return this.findById(userId);
  },

  async removeRole(userId: number, roleId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId, enabled: true },
    });

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    if (!userRole) {
      throw new NotFoundError("User role assignment");
    }

    await prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    return this.findById(userId);
  },

  async getUserRoles(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId, enabled: true },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    return user.roles.map((ur) => ur.role);
  },

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: { name: roleName.toUpperCase() },
      },
    });

    return userRole !== null;
  },
};
