const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testPpidKeberatanApi() {
  try {
    console.log('🧪 Testing PPID Pelaksana keberatan API...');
    
    // Get PPID Pelaksana
    const ppidPelaksana = await prisma.ppid.findFirst({
      where: { role: 'PPID_PELAKSANA' }
    });

    if (!ppidPelaksana) {
      console.log('❌ No PPID Pelaksana found');
      return;
    }

    console.log(`👤 Testing with PPID Pelaksana: ${ppidPelaksana.nama} (ID: ${ppidPelaksana.id})`);

    // Create JWT token
    const token = jwt.sign(
      { id: ppidPelaksana.id.toString(), role: 'PPID_PELAKSANA', userId: ppidPelaksana.id },
      process.env.JWT_SECRET
    );

    console.log('🔑 JWT Token created');

    // Test API call to /api/keberatan
    console.log('\n📡 Testing API call to /api/keberatan...');
    
    try {
      const response = await fetch('http://localhost:3000/api/keberatan', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        return;
      }

      const data = await response.json();
      console.log(`✅ API call successful`);
      console.log(`📊 Returned ${data.data?.length || 0} keberatan items`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n📋 Keberatan items returned:');
        data.data.forEach(k => {
          console.log(`   - Keberatan ${k.id}: Status=${k.status}, Assigned=${k.assigned_ppid_id}, Pemohon=${k.pemohon?.nama}`);
        });
      } else {
        console.log('⚠️ No keberatan items returned from API');
      }

      // Test notification logic simulation
      console.log('\n🔔 Testing notification logic...');
      const currentIds = data.data?.map(item => item.id.toString()) || [];
      console.log(`Current keberatan IDs: [${currentIds.join(', ')}]`);
      
      // Simulate notification history
      const mockHistory = {
        newObjections: []
      };
      
      const existingIds = mockHistory.newObjections.map(item => item.id);
      const newItems = currentIds
        .filter(id => !existingIds.includes(id))
        .map(id => ({
          id,
          status: 'unread',
          role: 'PPID_PELAKSANA',
          timestamp: Date.now()
        }));
      
      console.log(`New notification items: ${newItems.length}`);
      newItems.forEach(item => {
        console.log(`   - New notification for keberatan ${item.id}`);
      });

    } catch (fetchError) {
      console.log('❌ Fetch error:', fetchError.message);
      console.log('💡 Make sure the Next.js server is running on localhost:3000');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPpidKeberatanApi();