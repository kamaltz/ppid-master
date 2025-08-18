//
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { permissions, roles } = require("../../src/lib/roleUtils"); //

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Create Roles
  for (const role of Object.values(roles)) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name },
    });
  }
  console.log("Roles seeded.");

  // Create Permissions
  for (const permission of Object.values(permissions)) {
    await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: { name: permission },
    });
  }
  console.log("Permissions seeded.");

  // Assign all permissions to Admin role
  const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
  const allPermissions = await prisma.permission.findMany();

  if (adminRole) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log("All permissions assigned to Admin role.");
  }

  const hashedPassword = await bcrypt.hash("Garut@2025?", 10);
  const accounts = [
    { email: "admin@garut.go.id", role: "Admin" },
    { email: "ppid.utama@garut.go.id", role: "PPID_Utama" },
    { email: "ppid.pelaksana@garut.go.id", role: "PPID_Pelaksana" },
    { email: "atasan.ppid@garut.go.id", role: "Atasan_PPID" },
    { email: "pemohon@example.com", role: "Pemohon" },
  ];

  for (const account of accounts) {
    const userRole = await prisma.role.findUnique({
      where: { name: account.role },
    });
    if (userRole) {
      await prisma.user.upsert({
        where: { email: account.email },
        update: {},
        create: {
          email: account.email,
          password: hashedPassword,
          roleId: userRole.id,
          name: account.role,
          isVerified: true,
        },
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
