// Simple test to verify pages API functionality
const fetch = require('node-fetch');

async function testPagesAPI() {
  try {
    console.log('Testing Pages API...');
    
    // Test GET /api/pages
    console.log('\n1. Testing GET /api/pages');
    const getResponse = await fetch('http://localhost:3000/api/pages');
    const getResult = await getResponse.json();
    console.log('GET Response:', getResult);
    
    // Test POST /api/pages
    console.log('\n2. Testing POST /api/pages');
    const postResponse = await fetch('http://localhost:3000/api/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Page',
        slug: 'test-page',
        content: '<h1>This is a test page</h1><p>Created via API</p>',
        status: 'published'
      })
    });
    const postResult = await postResponse.json();
    console.log('POST Response:', postResult);
    
    // Test GET again to see the new page
    console.log('\n3. Testing GET /api/pages again');
    const getResponse2 = await fetch('http://localhost:3000/api/pages');
    const getResult2 = await getResponse2.json();
    console.log('GET Response after POST:', getResult2);
    
    console.log('\nTest completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPagesAPI();