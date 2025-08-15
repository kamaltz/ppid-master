import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with Prisma...');

    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const pemohonHash = await bcrypt.hash('pemohon123', 10);
    const ppidHash = await bcrypt.hash('ppid123', 10);

    // Clear existing data
    await prisma.request.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.pemohon.deleteMany();
    await prisma.ppid.deleteMany();
    console.log('✅ Cleared existing data');

    // Create admin
    await prisma.admin.create({
      data: {
        email: 'admin@ppid-garut.go.id',
        hashed_password: adminHash,
        nama: 'Administrator PPID'
      }
    });

    // Create pemohon
    await prisma.pemohon.create({
      data: {
        email: 'pemohon1@example.com',
        hashed_password: pemohonHash,
        nama: 'Ahmad Rizki',
        no_telepon: '081234567890',
        alamat: 'Jl. Contoh No. 1'
      }
    });

    // Create PPID
    await prisma.ppid.create({
      data: {
        no_pegawai: 'PPID001',
        email: 'ppid@ppid-garut.go.id',
        hashed_password: ppidHash,
        nama: 'PPID Utama',
        role: 'PPID'
      }
    });

    // Create sample request
    await prisma.request.create({
      data: {
        pemohon_id: 1,
        rincian_informasi: 'Sample request information',
        tujuan_penggunaan: 'Testing purpose'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@ppid-garut.go.id / admin123');
    console.log('Pemohon: pemohon1@example.com / pemohon123');
    console.log('PPID: ppid@ppid-garut.go.id / ppid123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();