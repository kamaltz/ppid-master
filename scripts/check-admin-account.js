const { PrismaClient } = require('@prisma/client');

async function checkAdminAccount() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking admin accounts...');
    
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true
      }
    });
    
    console.log('Admin accounts found:');
    admins.forEach(admin => {
      console.log(`- ID: ${admin.id}, Name: ${admin.nama}, Email: ${admin.email}, Role: ${admin.role}`);
    });
    
    // Also check PPID accounts
    const ppids = await prisma.ppid.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true
      }
    });
    
    console.log('\nPPID accounts found:');
    ppids.forEach(ppid => {
      console.log(`- ID: ${ppid.id}, Name: ${ppid.nama}, Email: ${ppid.email}, Role: ${ppid.role}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminAccount();