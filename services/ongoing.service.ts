import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import type { CreateOnGoingInput, UpdateOnGoingInput } from "@/lib/validators/ongoing";

export interface OnGoingQueryParams {
  processId?: string;
  page?: number;
  pageSize?: number;
}

export const ongoingService = {
  async findAll(params: OnGoingQueryParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where = {
      enabled: true,
      ...(params.processId && { processId: params.processId }),
    };

    const [items, total] = await Promise.all([
      prisma.onGoingList.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { onGoingDate: "desc" },
        include: {
          process: {
            select: { id: true, processNumber: true },
          },
        },
      }),
      prisma.onGoingList.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async findById(id: string) {
    const item = await prisma.onGoingList.findUnique({
      where: { id, enabled: true },
      include: {
        process: {
          select: { id: true, processNumber: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundError("OnGoingList", id);
    }

    return item;
  },

  async findByProcessId(processId: string, params: { page?: number; pageSize?: number } = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const where = {
      processId,
      enabled: true,
    };

    const [items, total] = await Promise.all([
      prisma.onGoingList.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { onGoingDate: "desc" },
      }),
      prisma.onGoingList.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async create(data: CreateOnGoingInput, createdBy?: string) {
    // Verify process exists
    const process = await prisma.process.findUnique({
      where: { id: data.processId, enabled: true },
    });

    if (!process) {
      throw new NotFoundError("Process", data.processId);
    }

    return prisma.onGoingList.create({
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

  async update(id: string, data: UpdateOnGoingInput, updatedBy?: string) {
    await this.findById(id);

    return prisma.onGoingList.update({
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
    return prisma.onGoingList.update({
      where: { id },
      data: {
        enabled: false,
        updatedBy: deletedBy,
      },
    });
  },
};
