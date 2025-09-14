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
    
    if (ppidUsers.rows.length === 0) {
      console.log('❌ No PPID Pelaksana found. Creating test user...');
      
      const newPpid = await client.query(`
        INSERT INTO ppid (nama, email, password, role, is_approved)
        VALUES ('PPID Pelaksana Test', 'ppid.pelaksana@test.com', '$2b$10$example', 'PPID_PELAKSANA', true)
        RETURNING id, nama, email
      `);
      
      console.log('✅ Created PPID Pelaksana:', newPpid.rows[0]);
    }
    
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
    
    console.log(`\\n📋 Found ${forwardedRequests.rows.length} forwarded requests:`);
    forwardedRequests.rows.forEach((req, index) => {
      console.log(`${index + 1}. ID: ${req.id} | Status: ${req.status} | Assigned to: ${req.ppid_nama || 'Unassigned'}`);
      console.log(`   Pemohon: ${req.pemohon_nama}`);
      console.log(`   Info: ${req.rincian_informasi.substring(0, 60)}...`);
    });
    
    // 3. Assign some requests to PPID Pelaksana for testing
    if (ppidUsers.rows.length > 0 && forwardedRequests.rows.length > 0) {
      const ppidId = ppidUsers.rows[0].id;
      const unassignedRequests = forwardedRequests.rows.filter(req => !req.assigned_ppid_id);
      
      if (unassignedRequests.length > 0) {
        console.log(`\n🔄 Assigning ${Math.min(2, unassignedRequests.length)} requests to PPID Pelaksana...`);
        
        for (let i = 0; i < Math.min(2, unassignedRequests.length); i++) {
          const req = unassignedRequests[i];
          await client.query(`
            UPDATE requests 
            SET assigned_ppid_id = $1 
            WHERE id = $2
          `, [ppidId, req.id]);
          
          console.log(`   ✅ Assigned request ${req.id} to PPID Pelaksana`);
        }
      }
    }
    
    // 4. Check keberatan for PPID Pelaksana
    const forwardedKeberatan = await client.query(`
      SELECT k.id, k.status, k.alasan_keberatan, k.assigned_ppid_id,
             p.nama as pemohon_nama, pp.nama as ppid_nama
      FROM keberatan k
      LEFT JOIN pemohon p ON k.pemohon_id = p.id
      LEFT JOIN ppid pp ON k.assigned_ppid_id = pp.id
      WHERE k.status = 'Diteruskan'
      ORDER BY k.created_at DESC
      LIMIT 5
    `);
    
    console.log(`\n📋 Found ${forwardedKeberatan.rows.length} forwarded keberatan:`);
    forwardedKeberatan.rows.forEach((keb, index) => {
      console.log(`${index + 1}. ID: ${keb.id} | Status: ${keb.status} | Assigned to: ${keb.ppid_nama || 'Unassigned'}`);
    });
    
    // 5. Test notification query for PPID Pelaksana
    if (ppidUsers.rows.length > 0) {
      const ppidId = ppidUsers.rows[0].id;
      
      console.log(`\n🧪 Testing notification queries for PPID Pelaksana ID: ${ppidId}`);
      
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
      
      // Test keberatan query
      const testKeberatan = await client.query(`
        SELECT k.id, k.status, k.assigned_ppid_id, p.nama as pemohon_nama
        FROM keberatan k
        LEFT JOIN pemohon p ON k.pemohon_id = p.id
        WHERE k.assigned_ppid_id = $1
        ORDER BY k.created_at DESC
      `, [ppidId]);
      
      console.log(`   📊 Keberatan assigned to this PPID: ${testKeberatan.rows.length}`);
      testKeberatan.rows.forEach(keb => {
        console.log(`      - Keberatan ${keb.id}: ${keb.status} (${keb.pemohon_nama})`);
      });
      
      // Test chat responses
      const testChatRequests = await client.query(`
        SELECT r.id, COUNT(rr.id) as response_count,
               MAX(rr.created_at) as last_response
        FROM requests r
        LEFT JOIN request_responses rr ON r.id = rr.request_id
        WHERE r.assigned_ppid_id = $1
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `, [ppidId]);
      
      console.log(`   💬 Chat activity for assigned requests:`);
      testChatRequests.rows.forEach(req => {
        console.log(`      - Request ${req.id}: ${req.response_count} messages, last: ${req.last_response || 'No messages'}`);
      });
    }
    
    console.log('\n✅ PPID Pelaksana notification fix completed!');
    console.log('\n📝 Summary:');
    console.log(`   - PPID Pelaksana users: ${ppidUsers.rows.length}`);
    console.log(`   - Forwarded requests: ${forwardedRequests.rows.length}`);
    console.log(`   - Forwarded keberatan: ${forwardedKeberatan.rows.length}`);\n    \n  } catch (error) {\n    console.error('❌ Error fixing PPID notifications:', error);\n  } finally {\n    client.release();\n    await pool.end();\n  }\n}\n\nfixPpidNotifications();\n