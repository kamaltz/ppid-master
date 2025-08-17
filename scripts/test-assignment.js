const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testAssignment() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing PPID assignment...');
    
    // Get first request with status 'Diajukan'
    const request = await client.query(`
      SELECT id, status, assigned_ppid_id, rincian_informasi 
      FROM requests 
      WHERE status = 'Diajukan' 
      LIMIT 1
    `);
    
    if (request.rows.length === 0) {
      console.log('❌ No requests with status "Diajukan" found');
      return;
    }
    
    const requestId = request.rows[0].id;
    console.log(`📝 Found request ID: ${requestId}`);
    console.log(`📄 Info: ${request.rows[0].rincian_informasi.substring(0, 50)}...`);
    
    // Get first PPID Pelaksana
    const ppid = await client.query(`
      SELECT id, nama 
      FROM ppid 
      WHERE role = 'PPID_PELAKSANA' 
      LIMIT 1
    `);
    
    if (ppid.rows.length === 0) {
      console.log('❌ No PPID Pelaksana found');
      return;
    }
    
    const ppidId = ppid.rows[0].id;
    console.log(`👤 Found PPID: ${ppid.rows[0].nama} (ID: ${ppidId})`);
    
    // Assign request to PPID
    await client.query(`
      UPDATE requests 
      SET assigned_ppid_id = $1, status = 'Diteruskan' 
      WHERE id = $2
    `, [ppidId, requestId]);
    
    console.log('✅ Assignment completed!');
    
    // Verify assignment
    const updated = await client.query(`
      SELECT r.id, r.status, r.assigned_ppid_id, p.nama as ppid_nama
      FROM requests r
      LEFT JOIN ppid p ON r.assigned_ppid_id = p.id
      WHERE r.id = $1
    `, [requestId]);
    
    const result = updated.rows[0];
    console.log(`📊 Result: Status = ${result.status}, Assigned to = ${result.ppid_nama || 'None'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testAssignment();