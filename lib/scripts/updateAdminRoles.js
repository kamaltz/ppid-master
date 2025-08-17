const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdminRoles() {
  try {
    // Update all existing admin records with default role
    const result = await prisma.admin.updateMany({
      where: {
        OR: [
          { role: null },
          { role: '' }
        ]
      },
      data: {
        role: 'ADMIN',
        permissions: JSON.stringify({
          informasi: true,
          kategori: true,
          chat: true,
          permohonan: true,
          keberatan: true
        })
      }
    });

    console.log(`Updated ${result.count} admin records with default role and permissions`);
    
    // Check current admin data
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        permissions: true
      }
    });
    
    console.log('Current admin data:', admins);
  } catch (error) {
    console.error('Error updating admin roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRoles();