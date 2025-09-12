import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

const accounts = [
  {
    nama: "Administrator Sistem",
    email: "admin@garutkab.go.id",
    password: "Garut@2025?",
    role: "Admin",
    table: "admin",
  },
  {
    nama: "PPID Utama",
    email: "ppid.utama@garutkab.go.id",
    password: "Garut@2025?",
    role: "PPID_UTAMA",
    table: "ppid",
  },
  {
    nama: "PPID Pelaksana",
    email: "ppid.pelaksana@garutkab.go.id",
    password: "Garut@2025?",
    role: "PPID_PELAKSANA",
    table: "ppid",
  },
  {
    nama: "Pemohon Test",
    email: "pemohon@gmail.com",
    password: "Garut@2025?",
    role: "Pemohon",
    table: "pemohon",
  },
];

async function resetAndSeedAccounts() {
  try {
    console.log("🗑️ Clearing existing accounts...");

    // Clear all existing accounts
    await prisma.keberatan.deleteMany();
    await prisma.request.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.pemohon.deleteMany();
    await prisma.ppid.deleteMany();

    console.log("✅ All accounts cleared");

    console.log("🌱 Creating new accounts...");

    for (const account of accounts) {
      const hashedPassword = await bcrypt.hash(account.password, 10);

      if (account.table === "admin") {
        await prisma.admin.create({
          data: {
            nama: account.nama,
            email: account.email,
            hashed_password: hashedPassword,
          },
        });
      } else if (account.table === "pemohon") {
        await prisma.pemohon.create({
          data: {
            nama: account.nama,
            email: account.email,
            hashed_password: hashedPassword,
          },
        });
      } else if (account.table === "ppid") {
        await prisma.ppid.create({
          data: {
            nama: account.nama,
            email: account.email,
            hashed_password: hashedPassword,
            role: account.role,
            no_pegawai: `PEG${Date.now()}`,
          },
        });
      }

      console.log(`✅ Created: ${account.nama} (${account.email})`);
    }

    console.log("🎉 Account seeding completed successfully!");
    console.log("\n📋 Default Accounts:");
    accounts.forEach((acc) => {
      console.log(`${acc.role}: ${acc.email} | Password: ${acc.password}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeedAccounts();
