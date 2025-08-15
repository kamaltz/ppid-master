import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function clearCrudData() {
  try {
    console.log('🗑️ Clearing CRUD data (keeping authentication data)...');

    // Clear CRUD tables only (keep user authentication tables)
    await prisma.keberatan.deleteMany({});
    console.log('✅ Keberatan data cleared');
    
    await prisma.permintaanInformasi.deleteMany({});
    console.log('✅ Permintaan informasi data cleared');
    
    await prisma.informasiPublik.deleteMany({});
    console.log('✅ Informasi publik data cleared');

    console.log('\n🎉 CRUD data cleared successfully!');
    console.log('\n📋 Authentication data preserved:');
    console.log('Admin: admin@garutkab.go.id / admin123');
    console.log('PPID: ppid@garutkab.go.id / ppid123');
    console.log('Atasan: atasan@garutkab.go.id / atasan123');
    console.log('Pemohon: pemohon@example.com / pemohon123');

  } catch (error) {
    console.error('❌ Error clearing CRUD data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearCrudData();