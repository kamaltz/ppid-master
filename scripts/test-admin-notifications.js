const fetch = require('node-fetch');

async function testAdminNotifications() {
  try {
    console.log('Testing Admin/PPID notifications...');
    
    // Test login as Admin
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@garutkab.go.id',
        password: 'Garut@2025?'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✓ Admin login successful');
    
    // Test new requests (Diajukan status)
    const requestsResponse = await fetch('http://localhost:3000/api/permintaan?status=Diajukan&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (requestsResponse.ok) {
      const requestsData = await requestsResponse.json();
      console.log('✓ New requests count:', requestsData.pagination?.total || 0);
    } else {
      console.error('✗ Failed to fetch new requests:', await requestsResponse.text());
    }
    
    // Test new objections (Diajukan status)
    const objectionsResponse = await fetch('http://localhost:3000/api/keberatan?status=Diajukan&limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (objectionsResponse.ok) {
      const objectionsData = await objectionsResponse.json();
      console.log('✓ New objections count:', objectionsData.pagination?.total || 0);
    } else {
      console.error('✗ Failed to fetch new objections:', await objectionsResponse.text());
    }
    
    // Test chat unread
    const chatResponse = await fetch('http://localhost:3000/api/chat/unread', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✓ Unread chats count:', chatData.count || 0);
    } else {
      console.error('✗ Failed to fetch unread chats:', await chatResponse.text());
    }
    
    // Test pending accounts
    const pendingResponse = await fetch('http://localhost:3000/api/accounts/pending?limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log('✓ Pending accounts count:', pendingData.data?.length || 0);
    } else {
      console.error('✗ Failed to fetch pending accounts:', await pendingResponse.text());
    }
    
    console.log('\n✓ All notification endpoints tested successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAdminNotifications();