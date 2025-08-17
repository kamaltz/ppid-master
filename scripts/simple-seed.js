const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestRequests() {
  try {
    console.log('Creating test requests...');

    // Create requests with different ages
    const requests = [
      { days: 35, title: 'Old Request 1 - Eligible' },
      { days: 28, title: 'Old Request 2 - Eligible' }, 
      { days: 25, title: 'Old Request 3 - Eligible' },
      { days: 14, title: 'Recent Request 1 - Not Eligible' },
      { days: 7, title: 'Recent Request 2 - Not Eligible' }
    ];

    for (const req of requests) {
      const date = new Date();
      date.setDate(date.getDate() - req.days);
      const dateStr = date.toISOString().slice(0, 19).replace('T', ' ');

      await prisma.$executeRaw`
        INSERT INTO permintaan (
          nama_lengkap, alamat, pekerjaan, no_telepon, email, 
          judul, rincian_informasi, tujuan_penggunaan,
          cara_memperoleh_informasi, cara_mendapat_salinan,
          status, created_at, updated_at
        ) VALUES (
          'Test User',
          'Jl. Test No. 123',
          'Tester', 
          '081234567890',
          'test@example.com',
          ${req.title},
          'Test information request for keberatan validation',
          'Testing purposes',
          'Email',
          'Email', 
          'Diproses',
          ${dateStr},
          ${dateStr}
        )
      `;

      console.log(`✅ Created: ${req.title} (${req.days} days ago)`);
    }

    console.log('🎉 Test requests created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestRequests();