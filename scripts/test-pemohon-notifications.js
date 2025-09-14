const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testPemohonNotifications() {
  try {
    console.log('🔍 Testing Pemohon notification system...');
    
    // Find a pemohon user
    const pemohon = await prisma.pemohon.findFirst();
    
    if (!pemohon) {
      console.log('❌ No pemohon found in database');
      return;
    }
    
    console.log(`👤 Testing with Pemohon ID: ${pemohon.id}, Name: ${pemohon.nama}`);
    
    // Check requests for this pemohon
    const requests = await prisma.request.findMany({
      where: { pemohon_id: pemohon.id },
      include: {
        responses: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });
    
    console.log(`\n📋 Found ${requests.length} requests for this pemohon:`);
    
    let unreadCount = 0;
    requests.forEach(req => {
      const lastResponse = req.responses[0];
      if (lastResponse) {
        const isFromPPID = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(lastResponse.user_role?.toUpperCase());
        console.log(`  - Request ${req.id}: Last message from ${lastResponse.user_role} ${isFromPPID ? '🔔 (UNREAD)' : ''}`);
        if (isFromPPID) unreadCount++;
      } else {
        console.log(`  - Request ${req.id}: No messages`);
      }
    });
    
    // Check keberatan for this pemohon
    const keberatan = await prisma.keberatan.findMany({
      where: { pemohon_id: pemohon.id },
      include: {
        responses: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });
    
    console.log(`\n📝 Found ${keberatan.length} keberatan for this pemohon:`);
    
    keberatan.forEach(keb => {
      const lastResponse = keb.responses[0];
      if (lastResponse) {
        const isFromPPID = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(lastResponse.user_role?.toUpperCase());
        console.log(`  - Keberatan ${keb.id}: Last message from ${lastResponse.user_role} ${isFromPPID ? '🔔 (UNREAD)' : ''}`);
        if (isFromPPID) unreadCount++;
      } else {
        console.log(`  - Keberatan ${keb.id}: No messages`);
      }
    });
    
    console.log(`\n🔔 Total unread notifications for pemohon: ${unreadCount}`);
    
    // Test the API endpoint logic
    console.log('\n🧪 Testing API endpoint logic simulation:');
    
    // Simulate the API logic for pemohon
    const requestsWithNewMessages = await prisma.request.findMany({
      where: { pemohon_id: pemohon.id },
      include: {
        responses: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });
    
    const keberatanWithNewMessages = await prisma.keberatan.findMany({
      where: { pemohon_id: pemohon.id },
      include: {
        responses: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });
    
    const apiUnreadCount = requestsWithNewMessages.filter(req => 
      req.responses[0] && req.responses[0].user_role && 
      ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(req.responses[0].user_role.toUpperCase())
    ).length + keberatanWithNewMessages.filter(keb => 
      keb.responses[0] && keb.responses[0].user_role && 
      ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(keb.responses[0].user_role.toUpperCase())
    ).length;
    
    console.log(`📊 API simulation result: ${apiUnreadCount} unread notifications`);
    
    // Check if there are any issues
    console.log('\n🔍 Checking for potential issues:');
    
    if (apiUnreadCount === 0) {
      console.log('⚠️  No unread notifications found. Possible issues:');
      console.log('   - No PPID has responded to pemohon requests');
      console.log('   - All conversations ended with pemohon messages');
      console.log('   - user_role field might be inconsistent');
      
      // Check for any responses at all
      const allResponses = await prisma.requestResponse.findMany({
        where: {
          request: {
            pemohon_id: pemohon.id
          }
        },
        orderBy: { created_at: 'desc' }
      });
      
      console.log(`   - Total responses in system: ${allResponses.length}`);
      if (allResponses.length > 0) {
        console.log('   - Recent response roles:', allResponses.slice(0, 5).map(r => r.user_role));
      }
    } else {
      console.log(`✅ Found ${apiUnreadCount} notifications - frontend issue likely`);
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error testing pemohon notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPemohonNotifications();