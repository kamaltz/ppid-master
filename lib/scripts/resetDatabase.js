import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️ Clearing database...');
  
  await prisma.keberatan.deleteMany({});
  await prisma.permintaanInformasi.deleteMany({});
  await prisma.informasiPublik.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('✅ Database cleared');
}

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Create users with different roles
  const adminPassword = await bcrypt.hash('admin123', 10);
  const ppidPassword = await bcrypt.hash('ppid123', 10);
  const atasanPassword = await bcrypt.hash('atasan123', 10);
  const pemohonPassword = await bcrypt.hash('pemohon123', 10);

  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@garutkab.go.id',
      password: adminPassword,
      nama: 'Administrator PPID',
      role: 'ADMIN'
    }
  });

  // PPID Users
  await prisma.user.create({
    data: {
      email: 'ppid@garutkab.go.id',
      password: ppidPassword,
      nama: 'PPID Utama',
      role: 'PPID_UTAMA'
    }
  });

  await prisma.user.create({
    data: {
      email: 'pelaksana@garutkab.go.id',
      password: ppidPassword,
      nama: 'PPID Pelaksana',
      role: 'PPID_PELAKSANA'
    }
  });

  // Atasan PPID
  await prisma.user.create({
    data: {
      email: 'atasan@garutkab.go.id',
      password: atasanPassword,
      nama: 'Atasan PPID',
      role: 'ATASAN_PPID'
    }
  });

  // Pemohon
  const pemohon1 = await prisma.user.create({
    data: {
      email: 'pemohon@example.com',
      password: pemohonPassword,
      nama: 'Ahmad Rizki',
      role: 'PEMOHON',
      noTelepon: '081234567890',
      alamat: 'Jl. Merdeka No. 123, Garut'
    }
  });

  const pemohon2 = await prisma.user.create({
    data: {
      email: 'pemohon2@example.com',
      password: pemohonPassword,
      nama: 'Siti Nurhaliza',
      role: 'PEMOHON',
      noTelepon: '081234567891',
      alamat: 'Jl. Sudirman No. 456, Garut'
    }
  });

  // Informasi Publik
  await prisma.informasiPublik.createMany({
    data: [
      {
        judul: 'Profil Singkat PPID Garut',
        klasifikasi: 'informasi-berkala',
        ringkasanIsiInformasi: 'Profil dan struktur organisasi PPID Kabupaten Garut',
        pejabatPenguasaInformasi: 'Kepala Dinas Komunikasi dan Informatika'
      },
      {
        judul: 'Daftar Informasi Publik 2024',
        klasifikasi: 'informasi-berkala',
        ringkasanIsiInformasi: 'Daftar lengkap informasi publik yang tersedia tahun 2024',
        pejabatPenguasaInformasi: 'PPID Utama'
      }
    ]
  });

  console.log('✅ Database seeded');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@garutkab.go.id / admin123');
  console.log('PPID: ppid@garutkab.go.id / ppid123');
  console.log('Pelaksana: pelaksana@garutkab.go.id / ppid123');
  console.log('Atasan: atasan@garutkab.go.id / atasan123');
  console.log('Pemohon: pemohon@example.com / pemohon123');
}

async function resetDatabase() {
  try {
    await clearDatabase();
    await seedDatabase();
    console.log('\n🎉 Database reset completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();