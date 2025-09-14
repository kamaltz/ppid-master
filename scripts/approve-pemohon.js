const { PrismaClient } = require('@prisma/client');

async function approvePemohon() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Approving pemohon account...');
    
    const result = await prisma.pemohon.updateMany({
      where: { email: 'pemohon@example.com' },
      data: { is_approved: true }
    });
    
    console.log('✓ Pemohon account approved:', result.count, 'records updated');
    
    // Check the account
    const pemohon = await prisma.pemohon.findFirst({
      where: { email: 'pemohon@example.com' },
      select: { id: true, nama: true, email: true, is_approved: true }
    });
    
    console.log('✓ Account status:', pemohon);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

approvePemohon();