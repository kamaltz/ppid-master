const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkNotifications() {
  const client = await pool.connect();
  
  try {
    console.log('Analyzing PPID Pelaksana notification logic...');
    
    const ppidId = 2;
    console.log(`Checking notifications for PPID Pelaksana ID: ${ppidId}`);
    
    // Check assigned requests with chat activity
    const chatRequests = await client.query(`
      SELECT r.id, r.status, r.assigned_ppid_id, p.nama as pemohon_nama,
             COUNT(rr.id) as message_count,
             (SELECT user_role FROM request_responses WHERE request_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message_role
      FROM requests r
      LEFT JOIN pemohon p ON r.pemohon_id = p.id
      LEFT JOIN request_responses rr ON r.id = rr.request_id
      WHERE r.assigned_ppid_id = $1 AND rr.id IS NOT NULL
      GROUP BY r.id, r.status, r.assigned_ppid_id, p.nama
      ORDER BY r.id DESC
    `, [ppidId]);
    
    console.log(`Requests with chat activity: ${chatRequests.rows.length}`);
    chatRequests.rows.forEach(req => {
      const shouldNotify = req.last_message_role === 'Pemohon';
      console.log(`  - Request ${req.id}: ${req.message_count} messages, last from: ${req.last_message_role} ${shouldNotify ? 'NOTIFY' : ''}`);
    });
    
    const unreadCount = chatRequests.rows.filter(req => 
      req.last_message_role && req.last_message_role.toUpperCase() === 'PEMOHON'
    ).length;
    console.log(`Total unread notifications: ${unreadCount}`);
    
    // Check for issues
    const unassignedForwarded = await client.query(`
      SELECT COUNT(*) as count FROM requests WHERE status = 'Diteruskan' AND assigned_ppid_id IS NULL
    `);
    console.log(`Unassigned forwarded requests: ${unassignedForwarded.rows[0].count}`);
    
    console.log('Analysis completed!');
    
  } catch (error) {
    console.error('Error analyzing notifications:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkNotifications();