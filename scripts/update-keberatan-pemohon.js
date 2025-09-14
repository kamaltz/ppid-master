const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateKeberatanPemohon() {
  try {
    console.log('🔧 Updating keberatan pemohon data...');
    
    // Find the dummy pemohon
    const dummyPemohon = await prisma.pemohon.findUnique({
      where: { email: 'pemohon@example.com' }
    });

    if (!dummyPemohon) {
      console.log('❌ Dummy pemohon not found');
      return;
    }

    console.log(`📋 Found dummy pemohon: ${dummyPemohon.nama} (${dummyPemohon.email})`);

    // Find all keberatan using dummy pemohon
    const keberatanWithDummy = await prisma.keberatan.findMany({
      where: { pemohon_id: dummyPemohon.id },
      include: {
        permintaan: {
          include: {
            pemohon: true
          }
        }
      }
    });

    console.log(`📊 Found ${keberatanWithDummy.length} keberatan using dummy pemohon`);

    for (const keberatan of keberatanWithDummy) {
      console.log(`\n🔍 Processing keberatan ID: ${keberatan.id}`);
      
      if (keberatan.permintaan?.pemohon) {
        const correctPemohon = keberatan.permintaan.pemohon;
        console.log(`   Updating pemohon from "${dummyPemohon.nama}" to "${correctPemohon.nama}"`);
        
        await prisma.keberatan.update({
          where: { id: keberatan.id },
          data: {
            pemohon_id: correctPemohon.id
          }
        });
        
        console.log(`   ✅ Updated keberatan ${keberatan.id}`);
      } else {
        console.log(`   ⚠️ No valid pemohon found for keberatan ${keberatan.id}`);
      }
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedKeberatan = await prisma.keberatan.findMany({
      include: {
        pemohon: {
          select: {
            nama: true,
            email: true
          }
        }
      }
    });

    console.log('\n📊 Updated keberatan list:');
    updatedKeberatan.forEach(item => {
      console.log(`   Keberatan ${item.id}: ${item.pemohon?.nama} (${item.pemohon?.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateKeberatanPemohon();