const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testPpidApi() {
  try {
    console.log('Testing PPID Pelaksana API endpoints...');
    
    // Create JWT token for PPID Pelaksana ID 2
    const token = jwt.sign(
      { id: '2', role: 'PPID_PELAKSANA', userId: 2 },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Created JWT token for PPID Pelaksana ID 2');
    
    const baseUrl = 'http://localhost:3000';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get requests for PPID Pelaksana
    console.log('\\n1. Testing /api/permintaan for PPID Pelaksana...');
    try {
      const response = await fetch(`${baseUrl}/api/permintaan?status=Diteruskan`, { headers });
      console.log(`   Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   Success: ${data.success}`);
        console.log(`   Requests count: ${data.data ? data.data.length : 0}`);
        if (data.data && data.data.length > 0) {
          data.data.forEach(req => {
            console.log(`     - Request ${req.id}: ${req.status} (assigned to: ${req.assigned_ppid_id})`);
          });
        }
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   Fetch error: ${error.message}`);
    }
    
    // Test 2: Get chat unread notifications
    console.log('\\n2. Testing /api/chat/unread for PPID Pelaksana...');
    try {
      const response = await fetch(`${baseUrl}/api/chat/unread`, { headers });
      console.log(`   Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   Success: ${data.success}`);
        console.log(`   Unread count: ${data.count}`);
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   Fetch error: ${error.message}`);
    }
    
    console.log('\\nAPI testing completed!');
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testPpidApi();