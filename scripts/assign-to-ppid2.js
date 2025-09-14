const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function assignToPpid2() {
  const client = await pool.connect();
  
  try {
    console.log('Assigning requests to PPID Pelaksana ID 2...');
    
    // Assign one of the forwarded requests to PPID ID 2
    await client.query(`
      UPDATE requests 
      SET assigned_ppid_id = 2 
      WHERE id = 7
    `);
    
    console.log('Assigned request 7 to PPID Pelaksana ID 2');
    
    // Add a new chat message from pemohon to trigger notification
    const pemohonName = await client.query(`SELECT nama FROM pemohon WHERE id = 1`);
    
    await client.query(`
      INSERT INTO request_responses (request_id, user_id, user_role, user_name, message)
      VALUES (7, '1', 'Pemohon', $1, 'Mohon info update status permohonan saya')
    `, [pemohonName.rows[0].nama]);
    
    console.log('Added new chat message from pemohon to request 7');
    
    // Verify
    const verifyRequests = await client.query(`
      SELECT r.id, r.status, r.assigned_ppid_id, p.nama as pemohon_nama,
             COUNT(rr.id) as message_count,
             MAX(rr.created_at) as last_message_time,
             (SELECT user_role FROM request_responses WHERE request_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message_role
      FROM requests r
      LEFT JOIN pemohon p ON r.pemohon_id = p.id
      LEFT JOIN request_responses rr ON r.id = rr.request_id
      WHERE r.assigned_ppid_id = 2
      GROUP BY r.id, r.status, r.assigned_ppid_id, p.nama
      ORDER BY r.created_at DESC
    `);
    
    console.log(`Requests assigned to PPID ID 2: ${verifyRequests.rows.length}`);
    verifyRequests.rows.forEach(req => {
      console.log(`  - Request ${req.id}: ${req.status} (${req.pemohon_nama})`);
      console.log(`    Messages: ${req.message_count}, Last from: ${req.last_message_role}`);
    });
    
    console.log('Assignment completed!');
    
  } catch (error) {
    console.error('Error assigning requests:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

assignToPpid2();