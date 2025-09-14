const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignKeberatanToPpid4() {
  try {
    console.log('🔧 Assigning keberatan to PPID Pelaksana ID 4...');
    
    // Find a keberatan with status "Diajukan" to forward
    const keberatanToAssign = await prisma.keberatan.findFirst({
      where: { 
        status: 'Diajukan',
        assigned_ppid_id: null
      },
      include: {
        pemohon: {
          select: { nama: true, email: true }
        }
      }
    });

    if (!keberatanToAssign) {
      console.log('❌ No keberatan available to assign');
      return;
    }

    console.log(`📋 Found keberatan to assign: ID ${keberatanToAssign.id} from ${keberatanToAssign.pemohon?.nama}`);

    // Assign to PPID Pelaksana ID 4 and change status to "Diteruskan"
    const updatedKeberatan = await prisma.keberatan.update({
      where: { id: keberatanToAssign.id },
      data: {
        assigned_ppid_id: 4,
        status: 'Diteruskan'
      }
    });

    console.log(`✅ Assigned keberatan ${updatedKeberatan.id} to PPID Pelaksana ID 4`);
    console.log(`   Status changed from "Diajukan" to "Diteruskan"`);

    // Verify the assignment
    const verifyKeberatan = await prisma.keberatan.findMany({
      where: {
        OR: [
          { assigned_ppid_id: 4 },
          { 
            status: 'Diteruskan',
            assigned_ppid_id: null 
          }
        ]
      },
      include: {
        pemohon: {
          select: { nama: true, email: true }
        }
      }
    });

    console.log(`\n📊 Keberatan now visible to PPID Pelaksana ID 4: ${verifyKeberatan.length}`);
    verifyKeberatan.forEach(k => {
      console.log(`   - Keberatan ${k.id}: Status=${k.status}, Assigned=${k.assigned_ppid_id}, Pemohon=${k.pemohon?.nama}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignKeberatanToPpid4();