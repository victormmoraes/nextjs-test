import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import type {
  CreateInteractionLogInput,
  CreateAccessLogInput,
} from "@/lib/validators/logging";

export interface InteractionLogQueryParams {
  userId?: number;
  tenantId?: number;
  interactionType?: string;
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface AccessLogQueryParams {
  userId?: number;
  tenantId?: number;
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface BotLogQueryParams {
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}

export const loggingService = {
  // User Interaction Logs
  async findInteractionLogs(params: InteractionLogQueryParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const where = {
      enabled: true,
      ...(params.userId && { userId: params.userId }),
      ...(params.tenantId && { tenantId: params.tenantId }),
      ...(params.interactionType && {
        interactionType: params.interactionType as never,
      }),
      ...(params.startDate &&
        params.endDate && {
          createdAt: {
            gte: params.startDate,
            lte: params.endDate,
          },
        }),
    };

    const [logs, total] = await Promise.all([
      prisma.userInteractionLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          tenant: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.userInteractionLog.count({ where }),
    ]);

    return { logs, total, page, pageSize };
  },

  async createInteractionLog(data: CreateInteractionLogInput, createdBy?: string) {
    return prisma.userInteractionLog.create({
      data: {
        ...data,
        createdBy,
        updatedBy: createdBy,
      },
    });
  },

  // User Access Logs
  async findAccessLogs(params: AccessLogQueryParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const where = {
      enabled: true,
      ...(params.userId && { userId: params.userId }),
      ...(params.tenantId && { tenantId: params.tenantId }),
      ...(params.startDate &&
        params.endDate && {
          loggedInAt: {
            gte: params.startDate,
            lte: params.endDate,
          },
        }),
    };

    const [logs, total] = await Promise.all([
      prisma.userAccessLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { loggedInAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          tenant: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.userAccessLog.count({ where }),
    ]);

    return { logs, total, page, pageSize };
  },

  async createAccessLog(data: CreateAccessLogInput, createdBy?: string) {
    return prisma.userAccessLog.create({
      data: {
        ...data,
        createdBy,
        updatedBy: createdBy,
      },
    });
  },

  // Daily Bot Logs
  async findBotLogs(params: BotLogQueryParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 30;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(params.startDate &&
        params.endDate && {
          createdAt: {
            gte: params.startDate,
            lte: params.endDate,
          },
        }),
    };

    const [logs, total] = await Promise.all([
      prisma.dailyBotLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.dailyBotLog.count({ where }),
    ]);

    return { logs, total, page, pageSize };
  },

  async findBotLogById(id: number) {
    const log = await prisma.dailyBotLog.findUnique({
      where: { id },
    });

    if (!log) {
      throw new NotFoundError("DailyBotLog", id);
    }

    return log;
  },

  async getTodayBotLog() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.dailyBotLog.findFirst({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  },

  async createBotLog(numberOfUpdates: number = 0) {
    return prisma.dailyBotLog.create({
      data: {
        numberOfUpdates,
      },
    });
  },

  async updateBotLog(id: number, numberOfUpdates: number) {
    await this.findBotLogById(id);

    return prisma.dailyBotLog.update({
      where: { id },
      data: { numberOfUpdates },
    });
  },

  async incrementBotLogUpdates(id: number, increment: number = 1) {
    await this.findBotLogById(id);

    return prisma.dailyBotLog.update({
      where: { id },
      data: {
        numberOfUpdates: { increment },
      },
    });
  },

  async getOrCreateTodayBotLog() {
    const existing = await this.getTodayBotLog();
    if (existing) {
      return existing;
    }
    return this.createBotLog();
  },
};
