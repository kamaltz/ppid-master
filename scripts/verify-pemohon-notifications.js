const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function verifyPemohonNotifications() {
  try {
    console.log('🔍 Verifying Pemohon notification system...');
    
    // Find a pemohon user
    const pemohon = await prisma.pemohon.findFirst();
    
    if (!pemohon) {
      console.log('❌ No pemohon found in database');
      return;
    }
    
    console.log(`👤 Testing with Pemohon ID: ${pemohon.id}, Name: ${pemohon.nama}`);
    
    // Create JWT token
    const tokenPayload = {
      id: pemohon.id.toString(),
      userId: pemohon.id,
      email: pemohon.email,
      nama: pemohon.nama,
      role: 'Pemohon'
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Test API call
    console.log('\n🧪 Testing API call...');
    
    try {
      const response = await fetch('http://localhost:3000/api/chat/unread', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
        console.log(`🔔 Notification count: ${data.count || 0}`);
        
        if (data.count > 0) {
          console.log('✅ Notifications are working! The frontend should show the badge.');
        } else {
          console.log('⚠️  No notifications found. Check if there are recent PPID messages.');
        }
      } else {
        console.log('❌ API Error:', response.status, await response.text());
      }
    } catch (fetchError) {
      console.log('❌ Fetch Error:', fetchError.message);
      console.log('💡 Make sure the development server is running on localhost:3000');
    }
    
    // Check database state
    console.log('\n📊 Database verification:');
    
    const requests = await prisma.request.findMany({
      where: { pemohon_id: pemohon.id },
      include: {
        responses: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });
    
    console.log(`📋 Found ${requests.length} requests for pemohon:`);
    
    let shouldHaveNotifications = 0;
    requests.forEach(req => {
      const lastResponse = req.responses[0];
      if (lastResponse) {
        const isFromPPID = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(lastResponse.user_role?.toUpperCase());
        console.log(`  - Request ${req.id}: Last message from "${lastResponse.user_role}" ${isFromPPID ? '🔔' : ''}`);
        if (isFromPPID) shouldHaveNotifications++;
      } else {
        console.log(`  - Request ${req.id}: No messages`);
      }
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`   - Pemohon should have ${shouldHaveNotifications} notifications`);
    console.log(`   - Frontend hook should fetch every 30 seconds`);
    console.log(`   - Check browser console for [usePemohonNotifications] logs`);
    
    console.log('\n🔧 Fixes applied:');
    console.log('   ✅ Fixed useEffect dependencies in usePemohonNotifications');
    console.log('   ✅ Added useCallback to AuthContext functions');
    console.log('   ✅ Improved error handling and logging');
    console.log('   ✅ Added proper state reset on errors');
    
    console.log('\n💡 If notifications still don\'t appear:');
    console.log('   1. Check browser console for error messages');
    console.log('   2. Verify the auth token is valid');
    console.log('   3. Make sure the user role is exactly "Pemohon"');
    console.log('   4. Check if the component is properly mounted');
    
  } catch (error) {
    console.error('❌ Error verifying notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPemohonNotifications();