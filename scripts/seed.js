import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const defaultPassword = "Garut@2025?";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  try {
    // Create Admin
    await prisma.admin.upsert({
      where: { email: "admin@garut.go.id" },
      update: {},
      create: {
        email: "admin@garut.go.id",
        hashed_password: hashedPassword,
        nama: "Administrator Sistem",
      },
    });

    // Create PPID Utama
    await prisma.ppid.upsert({
      where: { no_pegawai: "PPID001" },
      update: {
        email: "ppid.utama@garut.go.id",
        nama: "PPID Utama Diskominfo",
        role: "PPID_UTAMA",
      },
      create: {
        no_pegawai: "PPID001",
        email: "ppid.utama@garut.go.id",
        hashed_password: hashedPassword,
        nama: "PPID Utama Diskominfo",
        role: "PPID_UTAMA",
      },
    });

    // Create PPID Pelaksana
    await prisma.ppid.upsert({
      where: { no_pegawai: "PPID002" },
      update: {
        email: "ppid.pelaksana@garut.go.id",
        nama: "PPID Pelaksana Diskominfo",
        role: "PPID_PELAKSANA",
      },
      create: {
        no_pegawai: "PPID002",
        email: "ppid.pelaksana@garut.go.id",
        hashed_password: hashedPassword,
        nama: "PPID Pelaksana Diskominfo",
        role: "PPID_PELAKSANA",
      },
    });

    // Create Atasan PPID
    await prisma.ppid.upsert({
      where: { no_pegawai: "PPID003" },
      update: {
        email: "atasan.ppid@garut.go.id",
        nama: "Atasan PPID Diskominfo",
        role: "ATASAN_PPID",
      },
      create: {
        no_pegawai: "PPID003",
        email: "atasan.ppid@garut.go.id",
        hashed_password: hashedPassword,
        nama: "Atasan PPID Diskominfo",
        role: "ATASAN_PPID",
      },
    });

    // Create Pemohon
    await prisma.pemohon.upsert({
      where: { email: "pemohon@example.com" },
      update: {},
      create: {
        email: "pemohon@example.com",
        hashed_password: hashedPassword,
        nama: "Pemohon Test",
        nik: "3205012345678901",
        no_telepon: "081234567890",
        alamat: "Jl. Test No. 123, Garut",
      },
    });

    console.log("✅ Seed completed successfully!");
    console.log("\n📋 Default accounts created:");
    console.log(
      "┌─────────────────┬─────────────────────────────┬─────────────────┐"
    );
    console.log(
      "│ Role            │ Email                       │ Password        │"
    );
    console.log(
      "├─────────────────┼─────────────────────────────┼─────────────────┤"
    );
    console.log(
      "│ Admin           │ admin@garut.go.id           │ Garut@2025?     │"
    );
    console.log(
      "│ PPID Utama      │ ppid.utama@garut.go.id      │ Garut@2025?     │"
    );
    console.log(
      "│ PPID Pelaksana  │ ppid.pelaksana@garut.go.id  │ Garut@2025?     │"
    );
    console.log(
      "│ Atasan PPID     │ atasan.ppid@garut.go.id     │ Garut@2025?     │"
    );
    console.log(
      "│ Pemohon         │ pemohon@example.com         │ Garut@2025?     │"
    );
    console.log(
      "└─────────────────┴─────────────────────────────┴─────────────────┘"
    );
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
