const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function debugKeberatanNotif() {
  try {
    console.log('🔍 Debugging keberatan notifications for PPID Pelaksana...');
    
    // 1. Get PPID Pelaksana
    const ppidPelaksana = await prisma.ppid.findFirst({
      where: { role: 'PPID_PELAKSANA' }
    });

    if (!ppidPelaksana) {
      console.log('❌ No PPID Pelaksana found');
      return;
    }

    console.log(`👤 PPID Pelaksana: ${ppidPelaksana.nama} (ID: ${ppidPelaksana.id})`);

    // 2. Check all keberatan
    const allKeberatan = await prisma.keberatan.findMany({
      include: {
        pemohon: {
          select: { nama: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`\n📊 Total keberatan in database: ${allKeberatan.length}`);
    allKeberatan.forEach(k => {
      console.log(`   - Keberatan ${k.id}: Status=${k.status}, Assigned=${k.assigned_ppid_id}, Pemohon=${k.pemohon?.nama}`);
    });

    // 3. Test API call for PPID Pelaksana
    console.log(`\n🔧 Testing API call for PPID Pelaksana...`);
    
    // Create JWT token for PPID Pelaksana
    const token = jwt.sign(
      { id: ppidPelaksana.id.toString(), role: 'PPID_PELAKSANA', userId: ppidPelaksana.id },
      process.env.JWT_SECRET
    );

    // Simulate API call
    const userId = ppidPelaksana.id;
    const where = {
      OR: [
        { assigned_ppid_id: userId },
        { 
          status: 'Diteruskan',
          assigned_ppid_id: null 
        }
      ]
    };

    console.log('Query WHERE clause:', JSON.stringify(where, null, 2));

    const keberatanForPpid = await prisma.keberatan.findMany({
      where,
      include: {
        pemohon: {
          select: { nama: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`\n📋 Keberatan visible to PPID Pelaksana: ${keberatanForPpid.length}`);
    keberatanForPpid.forEach(k => {
      console.log(`   - Keberatan ${k.id}: Status=${k.status}, Assigned=${k.assigned_ppid_id}, Pemohon=${k.pemohon?.nama}`);
    });

    // 4. Test specific status filter
    const diteruskanKeberatan = await prisma.keberatan.findMany({
      where: {
        OR: [
          { assigned_ppid_id: userId, status: 'Diteruskan' },
          { assigned_ppid_id: null, status: 'Diteruskan' }
        ]
      },
      include: {
        pemohon: {
          select: { nama: true, email: true }
        }
      }
    });

    console.log(`\n🎯 Keberatan with status 'Diteruskan' for PPID Pelaksana: ${diteruskanKeberatan.length}`);
    diteruskanKeberatan.forEach(k => {
      console.log(`   - Keberatan ${k.id}: Status=${k.status}, Assigned=${k.assigned_ppid_id}, Pemohon=${k.pemohon?.nama}`);
    });

    // 5. Create test keberatan if none exist
    if (diteruskanKeberatan.length === 0) {
      console.log('\n🔧 Creating test keberatan...');
      
      const pemohon = await prisma.pemohon.findFirst();
      const request = await prisma.request.findFirst({
        where: { pemohon_id: pemohon?.id }
      });

      if (pemohon && request) {
        const testKeberatan = await prisma.keberatan.create({
          data: {
            permintaan_id: request.id,
            pemohon_id: pemohon.id,
            alasan_keberatan: 'Test keberatan untuk notifikasi PPID Pelaksana',
            status: 'Diteruskan',
            assigned_ppid_id: null // Unassigned forwarded keberatan
          }
        });

        console.log(`✅ Created test keberatan: ID ${testKeberatan.id}`);
      }
    }

    console.log('\n✅ Debug completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugKeberatanNotif();