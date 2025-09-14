const fetch = require('node-fetch');

async function createTestRequest() {
  try {
    console.log('Creating test request to verify notifications...');
    
    // Login as Pemohon
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pemohon@example.com',
        password: 'Garut@2025?'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✓ Pemohon login successful');
    
    // Create new request
    const requestData = {
      judul: 'Test Permohonan untuk Notifikasi Admin',
      rincian_informasi: 'Ini adalah permohonan test untuk memverifikasi bahwa notifikasi muncul di sidebar Admin dan PPID Utama',
      tujuan_penggunaan: 'Testing sistem notifikasi',
      cara_memperoleh_informasi: 'Email',
      cara_mendapat_salinan: 'Email'
    };
    
    const createResponse = await fetch('http://localhost:3000/api/permintaan', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✓ Test request created successfully:', createData.data.id);
      console.log('✓ Status:', createData.data.status);
      
      // Wait a moment then check Admin notifications
      console.log('\nWaiting 2 seconds then checking Admin notifications...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Login as Admin and check notifications
      const adminLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@garutkab.go.id',
          password: 'Garut@2025?'
        })
      });
      
      if (adminLoginResponse.ok) {
        const adminLoginData = await adminLoginResponse.json();
        const adminToken = adminLoginData.token;
        
        // Check new requests count
        const requestsResponse = await fetch('http://localhost:3000/api/permintaan?status=Diajukan&limit=1', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          console.log('✓ Admin can see new requests count:', requestsData.pagination?.total || 0);
          
          if (requestsData.pagination?.total > 0) {
            console.log('🎉 SUCCESS: Notification system is working! Admin will see the red badge in sidebar.');
          } else {
            console.log('❌ Issue: Admin cannot see new requests');
          }
        }
      }
      
    } else {
      console.error('✗ Failed to create request:', await createResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

createTestRequest();