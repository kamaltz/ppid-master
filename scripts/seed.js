import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const hashedPassword = await bcrypt.hash("Garut@2025?", 10);

  // Seed Admin
  await prisma.admin.upsert({
    where: { email: "admin@garut.go.id" },
    update: {},
    create: {
      email: "admin@garut.go.id",
      hashed_password: hashedPassword,
      nama: "Admin Utama",
      role: "ADMIN",
    },
  });
  console.log("Admin user created.");

  // Seed akun PPID
  await prisma.ppid.upsert({
    where: { email: "ppid.utama@garut.go.id" },
    update: {},
    create: {
      email: "ppid.utama@garut.go.id",
      no_pegawai: "001", // Nomor pegawai unik diperlukan
      hashed_password: hashedPassword,
      nama: "PPID Utama",
      role: "PPID_Utama",
    },
  });
  console.log("PPID Utama user created.");

  await prisma.ppid.upsert({
    where: { email: "ppid.pelaksana@garut.go.id" },
    update: {},
    create: {
      email: "ppid.pelaksana@garut.go.id",
      no_pegawai: "002", // Nomor pegawai unik diperlukan
      hashed_password: hashedPassword,
      nama: "PPID Pelaksana",
      role: "PPID_Pelaksana",
    },
  });
  console.log("PPID Pelaksana user created.");

  await prisma.ppid.upsert({
    where: { email: "atasan.ppid@garut.go.id" },
    update: {},
    create: {
      email: "atasan.ppid@garut.go.id",
      no_pegawai: "003", // Nomor pegawai unik diperlukan
      hashed_password: hashedPassword,
      nama: "Atasan PPID",
      role: "Atasan_PPID",
    },
  });
  console.log("Atasan PPID user created.");

  // Seed Pemohon
  await prisma.pemohon.upsert({
    where: { email: "pemohon@example.com" },
    update: {},
    create: {
      email: "pemohon@example.com",
      hashed_password: hashedPassword,
      nama: "Pemohon Test",
    },
  });
  console.log("Pemohon user created.");

  // Seed Kategori Informasi
  const categories = [
    {
      nama: "Informasi Berkala",
      slug: "informasi-berkala",
      deskripsi: "Informasi yang wajib disediakan dan diumumkan secara berkala"
    },
    {
      nama: "Informasi Serta Merta", 
      slug: "informasi-serta-merta",
      deskripsi: "Informasi yang wajib diumumkan serta merta"
    },
    {
      nama: "Informasi Setiap Saat",
      slug: "informasi-setiap-saat", 
      deskripsi: "Informasi yang wajib tersedia setiap saat"
    }
  ];

  for (const category of categories) {
    await prisma.kategoriInformasi.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }
  console.log("Categories created.");

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
