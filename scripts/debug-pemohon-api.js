const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function debugPemohonAPI() {
  try {
    console.log('🔍 Debugging Pemohon API call...');
    
    // Find a pemohon user
    const pemohon = await prisma.pemohon.findFirst();
    
    if (!pemohon) {
      console.log('❌ No pemohon found in database');
      return;
    }
    
    console.log(`👤 Found Pemohon ID: ${pemohon.id}, Name: ${pemohon.nama}, Email: ${pemohon.email}`);
    
    // Create a JWT token like the login would
    const tokenPayload = {
      id: pemohon.id.toString(),
      userId: pemohon.id,
      email: pemohon.email,
      nama: pemohon.nama,
      role: 'Pemohon'
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('🔑 Generated JWT token payload:', tokenPayload);
    
    // Decode the token to verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔓 Decoded JWT:', decoded);
    
    // Now simulate the API call logic
    console.log('\n🧪 Simulating /api/chat/unread API call...');
    
    const userRole = decoded.role;
    const userId = decoded.userId || parseInt(decoded.id || '0');
    
    console.log(`📊 API variables: userRole="${userRole}", userId=${userId}`);
    
    if (userRole === 'Pemohon') {
      console.log('✅ Role check passed - is Pemohon');
      
      // For pemohon, count chats where last message is from PPID/Admin (indicating unread)
      const requestsWithNewMessages = await prisma.request.findMany({
        where: { pemohon_id: userId },
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      
      console.log(`📋 Found ${requestsWithNewMessages.length} requests for pemohon ${userId}:`);
      
      requestsWithNewMessages.forEach(req => {
        const lastResponse = req.responses[0];
        if (lastResponse) {
          const isFromPPID = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(lastResponse.user_role?.toUpperCase());
          console.log(`  - Request ${req.id}: Last message from "${lastResponse.user_role}" ${isFromPPID ? '🔔 (UNREAD)' : ''}`);
        } else {
          console.log(`  - Request ${req.id}: No messages`);
        }
      });
      
      const keberatanWithNewMessages = await prisma.keberatan.findMany({
        where: { pemohon_id: userId },
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      
      console.log(`📝 Found ${keberatanWithNewMessages.length} keberatan for pemohon ${userId}:`);
      
      keberatanWithNewMessages.forEach(keb => {
        const lastResponse = keb.responses[0];
        if (lastResponse) {
          const isFromPPID = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(lastResponse.user_role?.toUpperCase());
          console.log(`  - Keberatan ${keb.id}: Last message from "${lastResponse.user_role}" ${isFromPPID ? '🔔 (UNREAD)' : ''}`);
        } else {
          console.log(`  - Keberatan ${keb.id}: No messages`);
        }
      });
      
      // Count chats where last message is from PPID/Admin (indicating unread)
      const unreadCount = requestsWithNewMessages.filter(req => 
        req.responses[0] && req.responses[0].user_role && 
        ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(req.responses[0].user_role.toUpperCase())
      ).length + keberatanWithNewMessages.filter(keb => 
        keb.responses[0] && keb.responses[0].user_role && 
        ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(keb.responses[0].user_role.toUpperCase())
      ).length;
      
      console.log(`\n🔔 Final unread count: ${unreadCount}`);
      console.log(`📤 API would return: { success: true, count: ${unreadCount} }`);
      
    } else {
      console.log('❌ Role check failed - not Pemohon');
    }
    
    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Error debugging pemohon API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPemohonAPI();