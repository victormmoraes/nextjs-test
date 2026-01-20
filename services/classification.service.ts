import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import type {
  CreateClassificationInput,
  UpdateClassificationInput,
} from "@/lib/validators/classification";

export interface ClassificationQueryParams {
  page?: number;
  pageSize?: number;
  category?: string;
}

export const classificationService = {
  async findAll(params: ClassificationQueryParams = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const where = {
      enabled: true,
      ...(params.category && { category: params.category }),
    };

    const [classifications, total] = await Promise.all([
      prisma.processClassification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ category: "asc" }, { subCategory: "asc" }, { name: "asc" }],
      }),
      prisma.processClassification.count({ where }),
    ]);

    return { classifications, total, page, pageSize };
  },

  async findById(id: number) {
    const classification = await prisma.processClassification.findUnique({
      where: { id, enabled: true },
    });

    if (!classification) {
      throw new NotFoundError("ProcessClassification", id);
    }

    return classification;
  },

  async getCategories() {
    const categories = await prisma.processClassification.findMany({
      where: { enabled: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return categories.map((c) => c.category);
  },

  async create(data: CreateClassificationInput, createdBy?: string) {
    return prisma.processClassification.create({
      data: {
        ...data,
        createdBy,
        updatedBy: createdBy,
      },
    });
  },

  async update(id: number, data: UpdateClassificationInput, updatedBy?: string) {
    const classification = await this.findById(id);

    return prisma.processClassification.update({
      where: { id: classification.id },
      data: {
        ...data,
        updatedBy,
      },
    });
  },

  async delete(id: number, deletedBy?: string) {
    const classification = await this.findById(id);

    // Check if classification is used by any process
    const processCount = await prisma.process.count({
      where: { classificationId: classification.id, enabled: true },
    });

    if (processCount > 0) {
      throw new ConflictError(
        `Cannot delete classification used by ${processCount} process(es)`
      );
    }

    // Soft delete
    return prisma.processClassification.update({
      where: { id: classification.id },
      data: {
        enabled: false,
        updatedBy: deletedBy,
      },
    });
  },
};
