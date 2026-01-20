import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database unseed...");

  // Delete in reverse order of dependencies

  // Delete Process-related data first
  console.log("Deleting process summaries...");
  const deletedSummaries = await prisma.processSummary.deleteMany({});
  console.log(`Deleted ${deletedSummaries.count} process summaries`);

  console.log("Deleting protocols...");
  const deletedProtocols = await prisma.protocol.deleteMany({});
  console.log(`Deleted ${deletedProtocols.count} protocols`);

  console.log("Deleting ongoing list entries...");
  const deletedOngoing = await prisma.onGoingList.deleteMany({});
  console.log(`Deleted ${deletedOngoing.count} ongoing list entries`);

  console.log("Deleting processes...");
  const deletedProcesses = await prisma.process.deleteMany({});
  console.log(`Deleted ${deletedProcesses.count} processes`);

  console.log("Deleting process classifications...");
  const deletedClassifications = await prisma.processClassification.deleteMany({});
  console.log(`Deleted ${deletedClassifications.count} process classifications`);

  // Delete logging data
  console.log("Deleting user interaction logs...");
  const deletedInteractionLogs = await prisma.userInteractionLog.deleteMany({});
  console.log(`Deleted ${deletedInteractionLogs.count} user interaction logs`);

  console.log("Deleting user access logs...");
  const deletedAccessLogs = await prisma.userAccessLog.deleteMany({});
  console.log(`Deleted ${deletedAccessLogs.count} user access logs`);

  console.log("Deleting daily bot logs...");
  const deletedBotLogs = await prisma.dailyBotLog.deleteMany({});
  console.log(`Deleted ${deletedBotLogs.count} daily bot logs`);

  // Delete auth data
  console.log("Deleting refresh tokens...");
  const deletedTokens = await prisma.refreshToken.deleteMany({});
  console.log(`Deleted ${deletedTokens.count} refresh tokens`);

  // Delete user roles (join table)
  console.log("Deleting user role assignments...");
  const deletedUserRoles = await prisma.userRole.deleteMany({});
  console.log(`Deleted ${deletedUserRoles.count} user role assignments`);

  // Delete users
  console.log("Deleting users...");
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`Deleted ${deletedUsers.count} users`);

  // Delete roles
  console.log("Deleting roles...");
  const deletedRoles = await prisma.role.deleteMany({});
  console.log(`Deleted ${deletedRoles.count} roles`);

  // Delete tenants
  console.log("Deleting tenants...");
  const deletedTenants = await prisma.tenant.deleteMany({});
  console.log(`Deleted ${deletedTenants.count} tenants`);

  console.log("\nDatabase unseed completed successfully!");
  console.log("All seeded data has been removed.");
}

main()
  .catch((e) => {
    console.error("Unseed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
