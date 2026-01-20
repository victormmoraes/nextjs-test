import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import type { CreateProcessInput, UpdateProcessInput } from "@/lib/validators/process";

export interface ProcessQueryParams {
  tenantId?: number;
  classificationId?: number;
  isFavorite?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
}

export const processService = {
  async findAll(params: ProcessQueryParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where = {
      enabled: true,
      ...(params.tenantId && { tenantId: params.tenantId }),
      ...(params.classificationId && { classificationId: params.classificationId }),
      ...(params.isFavorite !== undefined && { isFavorite: params.isFavorite }),
      ...(params.search && {
        OR: [
          { processNumber: { contains: params.search, mode: "insensitive" as const } },
          { interestedParties: { has: params.search } },
        ],
      }),
    };

    const [processes, total] = await Promise.all([
      prisma.process.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { lastUpdateDate: "desc" },
        include: {
          classification: true,
          tenant: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.process.count({ where }),
    ]);

    return { processes, total, page, pageSize };
  },

  async findById(id: string) {
    const process = await prisma.process.findUnique({
      where: { id, enabled: true },
      include: {
        classification: true,
        tenant: {
          select: { id: true, name: true },
        },
        summary: true,
        onGoingList: {
          where: { enabled: true },
          orderBy: { onGoingDate: "desc" },
        },
        protocols: {
          where: { enabled: true },
          orderBy: { protocolCreatedAt: "desc" },
        },
      },
    });

    if (!process) {
      throw new NotFoundError("Process", id);
    }

    return process;
  },

  async create(data: CreateProcessInput, createdBy?: string) {
    // Validate classification exists
    const classification = await prisma.processClassification.findUnique({
      where: { id: data.classificationId, enabled: true },
    });

    if (!classification) {
      throw new NotFoundError("ProcessClassification", data.classificationId);
    }

    // Validate tenant if provided
    if (data.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId, enabled: true },
      });

      if (!tenant) {
        throw new NotFoundError("Tenant", data.tenantId);
      }
    }

    // Validate dates
    if (data.lastUpdateDate < data.generationDate) {
      throw new ValidationError("Last update date cannot be before generation date");
    }

    return prisma.process.create({
      data: {
        ...data,
        createdBy,
        updatedBy: createdBy,
      },
      include: {
        classification: true,
        tenant: {
          select: { id: true, name: true },
        },
      },
    });
  },

  async update(id: string, data: UpdateProcessInput, updatedBy?: string) {
    const process = await this.findById(id);

    // Validate classification if updating
    if (data.classificationId) {
      const classification = await prisma.processClassification.findUnique({
        where: { id: data.classificationId, enabled: true },
      });

      if (!classification) {
        throw new NotFoundError("ProcessClassification", data.classificationId);
      }
    }

    // Validate dates
    const newGenDate = data.generationDate || process.generationDate;
    const newUpdateDate = data.lastUpdateDate || process.lastUpdateDate;

    if (newUpdateDate < newGenDate) {
      throw new ValidationError("Last update date cannot be before generation date");
    }

    return prisma.process.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
      },
      include: {
        classification: true,
        tenant: {
          select: { id: true, name: true },
        },
      },
    });
  },

  async delete(id: string, deletedBy?: string) {
    await this.findById(id);

    // Soft delete
    return prisma.process.update({
      where: { id },
      data: {
        enabled: false,
        updatedBy: deletedBy,
      },
    });
  },

  async addInterestedParty(id: string, party: string, updatedBy?: string) {
    const process = await this.findById(id);

    if (process.interestedParties.includes(party)) {
      throw new ValidationError(`Party '${party}' is already in the list`);
    }

    return prisma.process.update({
      where: { id },
      data: {
        interestedParties: [...process.interestedParties, party],
        updatedBy,
      },
    });
  },

  async removeInterestedParty(id: string, party: string, updatedBy?: string) {
    const process = await this.findById(id);

    if (!process.interestedParties.includes(party)) {
      throw new NotFoundError("Interested party", party);
    }

    return prisma.process.update({
      where: { id },
      data: {
        interestedParties: process.interestedParties.filter((p) => p !== party),
        updatedBy,
      },
    });
  },

  async toggleFavorite(id: string, updatedBy?: string) {
    const process = await this.findById(id);

    return prisma.process.update({
      where: { id },
      data: {
        isFavorite: !process.isFavorite,
        updatedBy,
      },
    });
  },
};
