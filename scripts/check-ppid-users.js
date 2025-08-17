const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPpidUsers() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Checking PPID users...');
    
    const result = await client.query('SELECT id, nama, email, role FROM ppid ORDER BY role, nama');
    
    if (result.rows.length === 0) {
      console.log('❌ No PPID users found');
    } else {
      console.log(`✅ Found ${result.rows.length} PPID users:`);
      result.rows.forEach(user => {
        console.log(`- ID: ${user.id} | ${user.nama} (${user.role}) | ${user.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPpidUsers();