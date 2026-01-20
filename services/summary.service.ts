import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import type { CreateSummaryInput, UpdateSummaryInput } from "@/lib/validators/summary";

export const summaryService = {
  async findByProcessId(processId: string) {
    const summary = await prisma.processSummary.findUnique({
      where: { processId, enabled: true },
    });

    if (!summary) {
      throw new NotFoundError("ProcessSummary for process", processId);
    }

    return summary;
  },

  async create(data: CreateSummaryInput, createdBy?: string) {
    // Verify process exists
    const process = await prisma.process.findUnique({
      where: { id: data.processId, enabled: true },
    });

    if (!process) {
      throw new NotFoundError("Process", data.processId);
    }

    // Check if summary already exists
    const existing = await prisma.processSummary.findUnique({
      where: { processId: data.processId },
    });

    if (existing) {
      throw new ConflictError("Summary already exists for this process");
    }

    return prisma.processSummary.create({
      data: {
        processId: data.processId,
        summaryData: data.summaryData as Prisma.InputJsonValue,
        lastSummarizedAt: data.lastSummarizedAt || new Date(),
        createdBy,
        updatedBy: createdBy,
      },
    });
  },

  async update(processId: string, data: UpdateSummaryInput, updatedBy?: string) {
    const summary = await this.findByProcessId(processId);

    return prisma.processSummary.update({
      where: { id: summary.id },
      data: {
        ...(data.summaryData && { summaryData: data.summaryData as Prisma.InputJsonValue }),
        ...(data.lastSummarizedAt !== undefined && {
          lastSummarizedAt: data.lastSummarizedAt,
        }),
        updatedBy,
      },
    });
  },

  async upsert(data: CreateSummaryInput, updatedBy?: string) {
    // Verify process exists
    const process = await prisma.process.findUnique({
      where: { id: data.processId, enabled: true },
    });

    if (!process) {
      throw new NotFoundError("Process", data.processId);
    }

    return prisma.processSummary.upsert({
      where: { processId: data.processId },
      create: {
        processId: data.processId,
        summaryData: data.summaryData as Prisma.InputJsonValue,
        lastSummarizedAt: data.lastSummarizedAt || new Date(),
        createdBy: updatedBy,
        updatedBy,
      },
      update: {
        summaryData: data.summaryData as Prisma.InputJsonValue,
        lastSummarizedAt: data.lastSummarizedAt || new Date(),
        updatedBy,
      },
    });
  },

  async delete(processId: string, deletedBy?: string) {
    const summary = await this.findByProcessId(processId);

    // Soft delete
    return prisma.processSummary.update({
      where: { id: summary.id },
      data: {
        enabled: false,
        updatedBy: deletedBy,
      },
    });
  },
};
