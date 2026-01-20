import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import type { CreateRoleInput, UpdateRoleInput } from "@/lib/validators/role";

export const roleService = {
  async findAll() {
    return prisma.role.findMany({
      orderBy: { name: "asc" },
    });
  },

  async findById(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundError("Role", id);
    }

    return role;
  },

  async findByName(name: string) {
    const role = await prisma.role.findUnique({
      where: { name: name.toUpperCase() },
    });

    if (!role) {
      throw new NotFoundError("Role", name);
    }

    return role;
  },

  async create(data: CreateRoleInput) {
    // Check if role already exists
    const existing = await prisma.role.findUnique({
      where: { name: data.name.toUpperCase() },
    });

    if (existing) {
      throw new ConflictError(`Role '${data.name}' already exists`);
    }

    return prisma.role.create({
      data: {
        name: data.name.toUpperCase(),
      },
    });
  },

  async update(id: number, data: UpdateRoleInput) {
    const role = await this.findById(id);

    if (data.name) {
      // Check if new name already exists
      const existing = await prisma.role.findFirst({
        where: {
          name: data.name.toUpperCase(),
          NOT: { id: role.id },
        },
      });

      if (existing) {
        throw new ConflictError(`Role '${data.name}' already exists`);
      }
    }

    return prisma.role.update({
      where: { id: role.id },
      data: {
        name: data.name?.toUpperCase(),
      },
    });
  },

  async delete(id: number) {
    const role = await this.findById(id);

    // Check if role is assigned to users
    const userCount = await prisma.userRole.count({
      where: { roleId: role.id },
    });

    if (userCount > 0) {
      throw new ConflictError(
        `Cannot delete role assigned to ${userCount} user(s). Remove assignments first.`
      );
    }

    return prisma.role.delete({
      where: { id: role.id },
    });
  },
};
