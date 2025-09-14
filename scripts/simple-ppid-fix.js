const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixPpidNotifications() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing PPID Pelaksana notifications...');
    
    // 1. Check current PPID Pelaksana users
    const ppidUsers = await client.query(`
      SELECT id, nama, role, email 
      FROM ppid 
      WHERE role = 'PPID_PELAKSANA'
      ORDER BY id
    `);
    
    console.log(`👥 Found ${ppidUsers.rows.length} PPID Pelaksana users:`);
    ppidUsers.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Name: ${user.nama}, Email: ${user.email}`);
    });
    
    // 2. Check requests that should be visible to PPID Pelaksana
    const forwardedRequests = await client.query(`
      SELECT r.id, r.status, r.rincian_informasi, r.assigned_ppid_id,
             p.nama as pemohon_nama, pp.nama as ppid_nama
      FROM requests r
      LEFT JOIN pemohon p ON r.pemohon_id = p.id
      LEFT JOIN ppid pp ON r.assigned_ppid_id = pp.id
      WHERE r.status = 'Diteruskan'
      ORDER BY r.created_at DESC
      LIMIT 10
    `);
    
    console.log(`📋 Found ${forwardedRequests.rows.length} forwarded requests:`);
    forwardedRequests.rows.forEach((req, index) => {
      console.log(`${index + 1}. ID: ${req.id} | Status: ${req.status} | Assigned to: ${req.ppid_nama || 'Unassigned'}`);
      console.log(`   Pemohon: ${req.pemohon_nama}`);
      console.log(`   Info: ${req.rincian_informasi.substring(0, 60)}...`);
    });
    
    // 3. Test notification query for PPID Pelaksana
    if (ppidUsers.rows.length > 0) {
      const ppidId = ppidUsers.rows[0].id;
      
      console.log(`🧪 Testing notification queries for PPID Pelaksana ID: ${ppidId}`);
      
      // Test requests query
      const testRequests = await client.query(`
        SELECT r.id, r.status, r.assigned_ppid_id, p.nama as pemohon_nama
        FROM requests r
        LEFT JOIN pemohon p ON r.pemohon_id = p.id
        WHERE r.assigned_ppid_id = $1
        ORDER BY r.created_at DESC
      `, [ppidId]);
      
      console.log(`   📊 Requests assigned to this PPID: ${testRequests.rows.length}`);
      testRequests.rows.forEach(req => {
        console.log(`      - Request ${req.id}: ${req.status} (${req.pemohon_nama})`);
      });
    }
    
    console.log('✅ PPID Pelaksana notification check completed!');
    
  } catch (error) {
    console.error('❌ Error fixing PPID notifications:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixPpidNotifications();