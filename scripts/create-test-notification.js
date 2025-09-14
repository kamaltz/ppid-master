const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createTestNotification() {
  try {
    console.log('🔧 Creating test notification for pemohon...');
    
    // Find a pemohon user
    const pemohon = await prisma.pemohon.findFirst();
    
    if (!pemohon) {
      console.log('❌ No pemohon found in database');
      return;
    }
    
    console.log(`👤 Found Pemohon ID: ${pemohon.id}, Name: ${pemohon.nama}`);
    
    // Find a request for this pemohon
    let request = await prisma.request.findFirst({
      where: { pemohon_id: pemohon.id }
    });
    
    if (!request) {
      console.log('📋 No existing request found, creating one...');
      
      // Create a test request
      request = await prisma.request.create({
        data: {
          pemohon_id: pemohon.id,
          rincian_informasi: 'Test request for notification testing',
          tujuan_penggunaan: 'Testing notifications',
          cara_memperoleh_informasi: 'Email',
          cara_mendapat_salinan: 'Email',
          status: 'Diproses',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      console.log(`✅ Created test request ID: ${request.id}`);
    } else {
      console.log(`📋 Using existing request ID: ${request.id}`);
    }
    
    // Add a response from PPID_PELAKSANA to create a notification
    const response = await prisma.requestResponse.create({
      data: {
        request_id: request.id,
        user_id: '2',
        user_name: 'PPID Pelaksana',
        user_role: 'PPID_PELAKSANA',
        message: 'Test message from PPID to create notification for pemohon',
        created_at: new Date()
      }
    });
    
    console.log(`💬 Created test response ID: ${response.id}`);
    console.log('✅ Test notification created successfully!');
    
    // Verify the notification would be counted
    const requestsWithNewMessages = await prisma.request.findMany({
      where: { pemohon_id: pemohon.id },
      include: {
        responses: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });
    
    const unreadCount = requestsWithNewMessages.filter(req => 
      req.responses[0] && req.responses[0].user_role && 
      ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(req.responses[0].user_role.toUpperCase())
    ).length;
    
    console.log(`🔔 Pemohon ${pemohon.id} should now have ${unreadCount} unread notifications`);
    
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotification();