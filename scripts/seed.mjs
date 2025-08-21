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
      no_pegawai: "001",
      hashed_password: hashedPassword,
      nama: "PPID Utama",
      role: "PPID_UTAMA",
    },
  });
  console.log("PPID Utama user created.");

  await prisma.ppid.upsert({
    where: { email: "ppid.pelaksana@garut.go.id" },
    update: {},
    create: {
      email: "ppid.pelaksana@garut.go.id",
      no_pegawai: "002",
      hashed_password: hashedPassword,
      nama: "PPID Pelaksana",
      role: "PPID_PELAKSANA",
    },
  });
  console.log("PPID Pelaksana user created.");

  await prisma.ppid.upsert({
    where: { email: "atasan.ppid@garut.go.id" },
    update: {},
    create: {
      email: "atasan.ppid@garut.go.id",
      no_pegawai: "003",
      hashed_password: hashedPassword,
      nama: "Atasan PPID",
      role: "ATASAN_PPID",
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

  // Seed Settings
  const defaultSettings = {
    general: {
      namaInstansi: 'PPID Diskominfo Kabupaten Garut',
      logo: '/logo-garut.svg',
      email: 'ppid@garutkab.go.id',
      telepon: '(0262) 123456',
      alamat: 'Jl. Pembangunan No. 1, Garut, Jawa Barat',
      websiteTitle: 'PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik',
      websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut.'
    },
    header: {
      menuItems: [
        { label: 'Beranda', url: '/', hasDropdown: false, dropdownItems: [] },
        { label: 'Profil', url: '/profil', hasDropdown: true, dropdownItems: [
          { label: 'Tentang PPID', url: '/profil' },
          { label: 'Visi Misi', url: '/visi-misi' },
          { label: 'Struktur Organisasi', url: '/struktur' }
        ]},
        { label: 'Informasi Publik', url: '/informasi', hasDropdown: false, dropdownItems: [] },
        { label: 'Layanan', url: '/layanan', hasDropdown: true, dropdownItems: [
          { label: 'Permohonan Informasi', url: '/permohonan' },
          { label: 'Keberatan', url: '/keberatan' }
        ]}
      ]
    }
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) }
    });
  }
  console.log("Settings seeded.");

  // Seed Categories
  const defaultCategories = [
    {
      nama: "Informasi Berkala",
      slug: "informasi-berkala",
      deskripsi: "Informasi yang wajib disediakan dan diumumkan secara berkala"
    },
    {
      nama: "Informasi Setiap Saat", 
      slug: "informasi-setiap-saat",
      deskripsi: "Informasi yang wajib tersedia setiap saat"
    },
    {
      nama: "Informasi Serta Merta",
      slug: "informasi-serta-merta", 
      deskripsi: "Informasi yang wajib diumumkan serta merta"
    }
  ];

  for (const category of defaultCategories) {
    await prisma.kategoriInformasi.upsert({
      where: { nama: category.nama },
      update: category,
      create: category
    });
  }
  console.log("Categories seeded.");

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