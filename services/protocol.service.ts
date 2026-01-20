import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import type { CreateProtocolInput, UpdateProtocolInput } from "@/lib/validators/protocol";

export interface ProtocolQueryParams {
  processId?: string;
  page?: number;
  pageSize?: number;
}

export const protocolService = {
  async findAll(params: ProtocolQueryParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where = {
      enabled: true,
      ...(params.processId && { processId: params.processId }),
    };

    const [protocols, total] = await Promise.all([
      prisma.protocol.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { protocolCreatedAt: "desc" },
        include: {
          process: {
            select: { id: true, processNumber: true },
          },
        },
      }),
      prisma.protocol.count({ where }),
    ]);

    return { protocols, total, page, pageSize };
  },

  async findById(id: string) {
    const protocol = await prisma.protocol.findUnique({
      where: { id, enabled: true },
      include: {
        process: {
          select: { id: true, processNumber: true },
        },
      },
    });

    if (!protocol) {
      throw new NotFoundError("Protocol", id);
    }

    return protocol;
  },

  async findByProcessId(processId: string, params: { page?: number; pageSize?: number } = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const where = {
      processId,
      enabled: true,
    };

    const [protocols, total] = await Promise.all([
      prisma.protocol.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { protocolCreatedAt: "desc" },
      }),
      prisma.protocol.count({ where }),
    ]);

    return { protocols, total, page, pageSize };
  },

  async create(data: CreateProtocolInput, createdBy?: string) {
    // Verify process exists
    const process = await prisma.process.findUnique({
      where: { id: data.processId, enabled: true },
    });

    if (!process) {
      throw new NotFoundError("Process", data.processId);
    }

    return prisma.protocol.create({
      data: {
        ...data,
        createdBy,
        updatedBy: createdBy,
      },
      include: {
        process: {
          select: { id: true, processNumber: true },
        },
      },
    });
  },

  async update(id: string, data: UpdateProtocolInput, updatedBy?: string) {
    await this.findById(id);

    return prisma.protocol.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
      },
      include: {
        process: {
          select: { id: true, processNumber: true },
        },
      },
    });
  },

  async delete(id: string, deletedBy?: string) {
    await this.findById(id);

    // Soft delete
    return prisma.protocol.update({
      where: { id },
      data: {
        enabled: false,
        updatedBy: deletedBy,
      },
    });
  },
};
