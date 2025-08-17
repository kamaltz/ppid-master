const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPpidAccess() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking PPID Pelaksana access...');
    
    // Check what PPID Pelaksana ID 2 should see
    const ppidId = 2;
    
    console.log(`👤 Checking access for PPID ID: ${ppidId}`);
    
    // Get requests assigned to this PPID
    const requests = await client.query(`
      SELECT r.id, r.status, r.rincian_informasi, r.assigned_ppid_id,
             p.nama as pemohon_nama, pp.nama as ppid_nama
      FROM requests r
      LEFT JOIN pemohon p ON r.pemohon_id = p.id
      LEFT JOIN ppid pp ON r.assigned_ppid_id = pp.id
      WHERE r.assigned_ppid_id = $1
      ORDER BY r.created_at DESC
    `, [ppidId]);
    
    console.log(`📊 Found ${requests.rows.length} requests assigned to this PPID:`);
    
    if (requests.rows.length === 0) {
      console.log('❌ No requests found for this PPID Pelaksana');
    } else {
      requests.rows.forEach((req, index) => {
        console.log(`${index + 1}. ID: ${req.id} | Status: ${req.status} | Pemohon: ${req.pemohon_nama}`);
        console.log(`   Info: ${req.rincian_informasi.substring(0, 60)}...`);
        console.log(`   Assigned to: ${req.ppid_nama}`);
        console.log('');
      });
    }
    
    // Check keberatan too
    const keberatan = await client.query(`
      SELECT k.id, k.status, k.alasan_keberatan, k.assigned_ppid_id,
             p.nama as pemohon_nama, pp.nama as ppid_nama
      FROM keberatan k
      LEFT JOIN pemohon p ON k.pemohon_id = p.id
      LEFT JOIN ppid pp ON k.assigned_ppid_id = pp.id
      WHERE k.assigned_ppid_id = $1
      ORDER BY k.created_at DESC
    `, [ppidId]);
    
    console.log(`📊 Found ${keberatan.rows.length} keberatan assigned to this PPID:`);
    
    if (keberatan.rows.length === 0) {
      console.log('❌ No keberatan found for this PPID Pelaksana');
    } else {
      keberatan.rows.forEach((keb, index) => {
        console.log(`${index + 1}. ID: ${keb.id} | Status: ${keb.status} | Pemohon: ${keb.pemohon_nama}`);
        console.log(`   Alasan: ${keb.alasan_keberatan.substring(0, 60)}...`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPpidAccess();