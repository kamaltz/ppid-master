const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating test data for PPID Pelaksana...');
    
    // 1. Get PPID Pelaksana ID
    const ppidResult = await client.query(`
      SELECT id FROM ppid WHERE role = 'PPID_PELAKSANA' LIMIT 1
    `);
    
    if (ppidResult.rows.length === 0) {
      console.log('❌ No PPID Pelaksana found');
      return;
    }
    
    const ppidId = ppidResult.rows[0].id;
    console.log(`👤 Using PPID Pelaksana ID: ${ppidId}`);
    
    // 2. Get a pemohon ID
    const pemohonResult = await client.query(`
      SELECT id FROM pemohon LIMIT 1
    `);
    
    if (pemohonResult.rows.length === 0) {
      console.log('❌ No pemohon found');
      return;
    }
    
    const pemohonId = pemohonResult.rows[0].id;
    console.log(`👤 Using Pemohon ID: ${pemohonId}`);
    
    // 3. Create a forwarded request
    const newRequest = await client.query(`
      INSERT INTO requests (pemohon_id, judul, rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi, cara_mendapat_salinan, status, assigned_ppid_id)
      VALUES ($1, 'Test Request for PPID Pelaksana', 'Informasi test untuk notifikasi PPID Pelaksana', 'Testing notification system', 'Email', 'Email', 'Diteruskan', $2)
      RETURNING id, judul, status
    `, [pemohonId, ppidId]);
    
    console.log(`✅ Created test request:`);\n    console.log(`   ID: ${newRequest.rows[0].id}`);\n    console.log(`   Title: ${newRequest.rows[0].judul}`);\n    console.log(`   Status: ${newRequest.rows[0].status}`);\n    \n    // 4. Create another unassigned forwarded request\n    const unassignedRequest = await client.query(`\n      INSERT INTO requests (pemohon_id, judul, rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi, cara_mendapat_salinan, status)\n      VALUES ($1, 'Unassigned Forwarded Request', 'Request yang belum di-assign ke PPID manapun', 'Testing unassigned logic', 'Email', 'Email', 'Diteruskan')\n      RETURNING id, judul, status\n    `, [pemohonId]);\n    \n    console.log(`✅ Created unassigned request:`);\n    console.log(`   ID: ${unassignedRequest.rows[0].id}`);\n    console.log(`   Title: ${unassignedRequest.rows[0].judul}`);\n    console.log(`   Status: ${unassignedRequest.rows[0].status}`);\n    \n    // 5. Add some chat responses to make it interesting\n    await client.query(`\n      INSERT INTO request_responses (request_id, user_id, user_role, message)\n      VALUES \n        ($1, $2, 'Pemohon', 'Halo, saya ingin menanyakan status permohonan saya'),\n        ($1, $3, 'PPID_PELAKSANA', 'Terima kasih atas permohonannya, sedang kami proses')\n    `, [newRequest.rows[0].id, pemohonId.toString(), ppidId.toString()]);\n    \n    console.log(`💬 Added chat messages to request ${newRequest.rows[0].id}`);\n    \n    // 6. Verify the data\n    const verifyRequests = await client.query(`\n      SELECT r.id, r.status, r.assigned_ppid_id, p.nama as pemohon_nama\n      FROM requests r\n      LEFT JOIN pemohon p ON r.pemohon_id = p.id\n      WHERE r.status = 'Diteruskan'\n      ORDER BY r.created_at DESC\n    `);\n    \n    console.log(`\\n📊 Current forwarded requests: ${verifyRequests.rows.length}`);\n    verifyRequests.rows.forEach(req => {\n      console.log(`   - Request ${req.id}: Assigned to PPID ${req.assigned_ppid_id || 'Unassigned'} (${req.pemohon_nama})`);\n    });\n    \n    console.log('\\n✅ Test data creation completed!');\n    \n  } catch (error) {\n    console.error('❌ Error creating test data:', error);\n  } finally {\n    client.release();\n    await pool.end();\n  }\n}\n\ncreateTestData();