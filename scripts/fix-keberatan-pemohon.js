const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixKeberatanPemohon() {
  try {
    console.log('🔧 Fixing keberatan pemohon data...');
    
    // Get all keberatan with their pemohon data
    const keberatan = await prisma.keberatan.findMany({
      include: {
        pemohon: true,
        permintaan: {
          include: {
            pemohon: true
          }
        }
      }
    });

    console.log(`📊 Found ${keberatan.length} keberatan records`);

    for (const item of keberatan) {
      console.log(`\n🔍 Checking keberatan ID: ${item.id}`);
      console.log(`   Current pemohon_id: ${item.pemohon_id}`);
      console.log(`   Current pemohon data: ${item.pemohon ? `${item.pemohon.nama} (${item.pemohon.email})` : 'NULL'}`);
      console.log(`   Related request pemohon: ${item.permintaan?.pemohon ? `${item.permintaan.pemohon.nama} (${item.permintaan.pemohon.email})` : 'NULL'}`);

      // If keberatan pemohon is null but request has pemohon, fix it
      if (!item.pemohon && item.permintaan?.pemohon) {
        console.log(`   ⚠️ Fixing pemohon_id from ${item.pemohon_id} to ${item.permintaan.pemohon.id}`);
        
        await prisma.keberatan.update({
          where: { id: item.id },
          data: {
            pemohon_id: item.permintaan.pemohon.id
          }
        });
        
        console.log(`   ✅ Fixed keberatan ${item.id} pemohon_id`);
      } else if (item.pemohon) {
        console.log(`   ✅ Keberatan ${item.id} has valid pemohon data`);
      } else {
        console.log(`   ❌ Keberatan ${item.id} has no valid pemohon data to fix`);
      }
    }

    // Verify the fix
    console.log('\n🔍 Verifying fixes...');
    const fixedKeberatan = await prisma.keberatan.findMany({
      include: {
        pemohon: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      }
    });

    console.log('\n📊 After fix:');
    fixedKeberatan.forEach(item => {
      console.log(`   Keberatan ${item.id}: ${item.pemohon ? `${item.pemohon.nama} (${item.pemohon.email})` : 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKeberatanPemohon();