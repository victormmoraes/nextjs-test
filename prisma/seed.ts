import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create Roles
  console.log("Creating roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  });

  console.log(`Roles created: ${adminRole.name}, ${userRole.name}`);

  // Create Tenant
  console.log("Creating tenant...");
  const tenant = await prisma.tenant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Default Organization",
      tenantLogo: null,
      createdBy: "system",
      updatedBy: "system",
    },
  });

  console.log(`Tenant created: ${tenant.name}`);

  // Create Admin User
  console.log("Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      tenantId: tenant.id,
      createdBy: "system",
      updatedBy: "system",
    },
  });

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log(`Admin user created: ${adminUser.email}`);

  // Create Regular User
  console.log("Creating regular user...");
  const regularUserPassword = await bcrypt.hash("user123", 12);

  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Regular User",
      email: "user@example.com",
      password: regularUserPassword,
      tenantId: tenant.id,
      createdBy: "system",
      updatedBy: "system",
    },
  });

  // Assign user role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: userRole.id,
    },
  });

  console.log(`Regular user created: ${regularUser.email}`);

  // Create Process Classifications
  console.log("Creating process classifications...");
  const classificationsData = [
    {
      name: "Registro de Produto",
      abbreviation: "REG",
      category: "Registro",
      subCategory: "Produto",
    },
    {
      name: "Alteracao de Registro",
      abbreviation: "ALT",
      category: "Registro",
      subCategory: "Alteracao",
    },
    {
      name: "Cancelamento de Registro",
      abbreviation: "CAN",
      category: "Registro",
      subCategory: "Cancelamento",
    },
    {
      name: "Consulta Tecnica",
      abbreviation: "CON",
      category: "Consulta",
      subCategory: "Tecnica",
    },
    {
      name: "Recurso Administrativo",
      abbreviation: "REC",
      category: "Recurso",
      subCategory: "Administrativo",
    },
  ];

  const createdClassifications = [];
  for (const classData of classificationsData) {
    const classification = await prisma.processClassification.upsert({
      where: { abbreviation: classData.abbreviation },
      update: {},
      create: {
        ...classData,
        createdBy: "system",
        updatedBy: "system",
      },
    });
    createdClassifications.push(classification);
  }

  console.log(`${createdClassifications.length} classifications created`);

  // Create Sample Process with random UUID
  console.log("Creating sample process...");
  const sampleProcess = await prisma.process.create({
    data: {
      id: randomUUID(),
      processNumber: "25351.000001/2024-01",
      classificationId: createdClassifications[0].id,
      tenantId: tenant.id,
      generationDate: new Date("2024-01-15"),
      lastUpdateDate: new Date("2024-06-20"),
      interestedParties: ["Company ABC", "Company XYZ"],
      pdfUrl: "https://example.com/documents/process-001.pdf",
      isFavorite: false,
      createdBy: "system",
      updatedBy: "system",
    },
  });

  console.log(`Sample process created: ${sampleProcess.processNumber} (${sampleProcess.id})`);

  // Create Sample OnGoingList entry with random UUID
  const ongoingEntry = await prisma.onGoingList.create({
    data: {
      id: randomUUID(),
      processId: sampleProcess.id,
      onGoingDate: new Date("2024-06-20"),
      onGoingUnit: "GGTOX",
      onGoingDescription: "Processo encaminhado para analise tecnica",
      createdBy: "system",
      updatedBy: "system",
    },
  });

  console.log(`Sample ongoing entry created (${ongoingEntry.id})`);

  // Create Sample Protocol with random UUID
  const protocol = await prisma.protocol.create({
    data: {
      id: randomUUID(),
      processId: sampleProcess.id,
      protocolNumber: "PROT-2024-001",
      protocolType: "Entrada",
      protocolUnit: "Protocolo Central",
      protocolCreatedAt: new Date("2024-01-15"),
      protocolIncludedAt: new Date("2024-01-15"),
      createdBy: "system",
      updatedBy: "system",
    },
  });

  console.log(`Sample protocol created (${protocol.id})`);

  // Create Sample Process Summary (UUID auto-generated by Prisma)
  const summary = await prisma.processSummary.create({
    data: {
      processId: sampleProcess.id,
      summaryData: {
        title: "Sample Process Summary",
        description: "This is a sample process for testing purposes",
        keyPoints: [
          "Initial registration request",
          "Technical analysis pending",
          "Documentation complete",
        ],
        status: "In Progress",
      },
      lastSummarizedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
    },
  });

  console.log(`Sample process summary created (${summary.id})`);

  console.log("\nDatabase seed completed successfully!");
  console.log("\nSummary:");
  console.log("   - 2 Roles (ADMIN, USER)");
  console.log("   - 1 Tenant (Default Organization)");
  console.log("   - 2 Users:");
  console.log("     - admin@example.com (password: admin123) - ADMIN role");
  console.log("     - user@example.com (password: user123) - USER role");
  console.log("   - 5 Process Classifications");
  console.log("   - 1 Sample Process with ongoing entry, protocol, and summary");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
