const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdminPermissions() {
  try {
    // Update admin with permissions
    const result = await prisma.admin.updateMany({
      where: {
        permissions: null
      },
      data: {
        permissions: JSON.stringify({
          informasi: true,
          kategori: true,
          chat: true,
          permohonan: true,
          keberatan: true
        })
      }
    });

    console.log(`Updated ${result.count} admin records with permissions`);
    
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
    
    console.log('Updated admin data:', admins);
  } catch (error) {
    console.error('Error setting admin permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminPermissions();