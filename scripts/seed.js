const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

// --- Definisi roleUtils dipindahkan ke sini ---
const permissions = {
  CREATE_USER: "create_user",
  READ_USER: "read_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_ROLES: "manage_roles",
  MANAGE_PERMISSIONS: "manage_permissions",
  VIEW_DASHBOARD: "view_dashboard",
  MANAGE_INFORMASI: "manage_informasi",
  MANAGE_PERMOHONAN: "manage_permohonan",
  MANAGE_KEBERATAN: "manage_keberatan",
  VIEW_LOGS: "view_logs",
  ASSIGN_PERMOHONAN: "assign_permohonan",
  RESPOND_PERMOHONAN: "respond_permohonan",
  RESPOND_KEBERATAN: "respond_keberatan",
};

const roles = {
  Admin: { name: "Admin", permissions: Object.values(permissions) },
  PPID_Utama: {
    name: "PPID_Utama",
    permissions: [
      permissions.VIEW_DASHBOARD,
      permissions.MANAGE_INFORMASI,
      permissions.MANAGE_PERMOHONAN,
      permissions.MANAGE_KEBERATAN,
      permissions.ASSIGN_PERMOHONAN,
    ],
  },
  PPID_Pelaksana: {
    name: "PPID_Pelaksana",
    permissions: [
      permissions.VIEW_DASHBOARD,
      permissions.RESPOND_PERMOHONAN,
      permissions.RESPOND_KEBERATAN,
    ],
  },
  Atasan_PPID: {
    name: "Atasan_PPID",
    permissions: [
      permissions.VIEW_DASHBOARD,
      permissions.MANAGE_PERMOHONAN,
      permissions.MANAGE_KEBERATAN,
    ],
  },
  Pemohon: { name: "Pemohon", permissions: [] },
};
// --- Akhir dari definisi roleUtils ---

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Buat Roles
  for (const role of Object.values(roles)) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name },
    });
  }
  console.log("Roles seeded.");

  // Buat Permissions
  for (const permission of Object.values(permissions)) {
    await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: { name: permission },
    });
  }
  console.log("Permissions seeded.");

  // Berikan semua permissions ke role Admin
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
