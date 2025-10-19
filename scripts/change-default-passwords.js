const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function changeDefaultPasswords() {
  try {
    console.log('🔐 Mengubah password default sistem...');
    
    const newPassword = process.argv[2] || 'Garut@2025?';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update Admin accounts
    const adminResult = await prisma.admin.updateMany({
      where: {
        OR: [
          { password: await bcrypt.hash('admin123', 12) },
          { email: { in: ['admin@ppid.garut.go.id', 'admin@diskominfo.garut.go.id'] } }
        ]
      },
      data: {
        password: hashedPassword
      }
    });
    
    // Update PPID accounts
    const ppidResult = await prisma.ppid.updateMany({
      where: {
        OR: [
          { password: await bcrypt.hash('ppid123', 12) },
          { email: { contains: '@ppid.garut.go.id' } }
        ]
      },
      data: {
        password: hashedPassword
      }
    });
    
    // Update Pemohon accounts with default passwords
    const pemohonResult = await prisma.pemohon.updateMany({
      where: {
        OR: [
          { password: await bcrypt.hash('pemohon123', 12) },
          { password: await bcrypt.hash('123456', 12) }
        ]
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log(`✅ Password berhasil diubah:`);
    console.log(`   - Admin: ${adminResult.count} akun`);
    console.log(`   - PPID: ${ppidResult.count} akun`);
    console.log(`   - Pemohon: ${pemohonResult.count} akun`);
    console.log(`🔑 Password baru: ${newPassword}`);
    
    return { success: true, newPassword, counts: { admin: adminResult.count, ppid: ppidResult.count, pemohon: pemohonResult.count } };
    
  } catch (error) {
    console.error('❌ Error mengubah password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

changeDefaultPasswords();