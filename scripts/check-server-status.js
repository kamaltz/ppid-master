const fetch = require('node-fetch');

async function checkServerStatus() {
  try {
    console.log('Checking if server is running...');
    
    // Check if server is running on port 3000
    try {
      const response = await fetch('http://localhost:3000/api/health', {
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server is running!');
        console.log('Health check:', data);
        return true;
      } else {
        console.log('❌ Server responded with error:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('Error:', error.message);
      return false;
    }
  } catch (error) {
    console.error('Error checking server status:', error);
    return false;
  }
}

checkServerStatus();