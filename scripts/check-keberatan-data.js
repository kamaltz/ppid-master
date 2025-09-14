const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkKeberatanData() {
  try {
    console.log('🔍 Checking keberatan data...');
    
    const keberatan = await prisma.keberatan.findMany({
      include: {
        pemohon: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        },
        permintaan: {
          select: {
            id: true,
            rincian_informasi: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📊 Found ${keberatan.length} keberatan records:`);
    
    keberatan.forEach((item, index) => {
      console.log(`\n${index + 1}. Keberatan ID: ${item.id}`);
      console.log(`   Pemohon ID: ${item.pemohon_id}`);
      console.log(`   Pemohon Data: ${item.pemohon ? `${item.pemohon.nama} (${item.pemohon.email})` : 'NULL'}`);
      console.log(`   Permintaan ID: ${item.permintaan_id}`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Alasan: ${item.alasan_keberatan.substring(0, 50)}...`);
      console.log(`   Created: ${item.created_at}`);
    });

    // Also check pemohon data
    console.log('\n👥 All pemohon data:');
    const allPemohon = await prisma.pemohon.findMany({
      select: {
        id: true,
        nama: true,
        email: true
      }
    });

    allPemohon.forEach(p => {
      console.log(`   - ID: ${p.id}, Nama: ${p.nama}, Email: ${p.email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKeberatanData();