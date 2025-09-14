const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixNotificationLogic() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Analyzing and fixing PPID Pelaksana notification logic...');
    
    // 1. Check what PPID Pelaksana should see based on current logic
    const ppidId = 2; // PPID Pelaksana ID
    
    console.log(`\\n👤 Analyzing notifications for PPID Pelaksana ID: ${ppidId}`);
    
    // Test current notification logic for requests
    console.log('\\n📋 Testing request notifications:');
    
    // Query 1: Assigned requests with status "Diteruskan"
    const assignedRequests = await client.query(`
      SELECT r.id, r.status, r.assigned_ppid_id, p.nama as pemohon_nama,
             COUNT(rr.id) as message_count,
             MAX(rr.created_at) as last_message_time,
             (SELECT user_role FROM request_responses WHERE request_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message_role
      FROM requests r
      LEFT JOIN pemohon p ON r.pemohon_id = p.id
      LEFT JOIN request_responses rr ON r.id = rr.request_id
      WHERE r.assigned_ppid_id = $1 AND r.status = 'Diteruskan'
      GROUP BY r.id, r.status, r.assigned_ppid_id, p.nama
      ORDER BY r.created_at DESC
    `, [ppidId]);
    
    console.log(`   ✅ Assigned "Diteruskan" requests: ${assignedRequests.rows.length}`);
    assignedRequests.rows.forEach(req => {
      console.log(`      - Request ${req.id}: ${req.message_count} messages, last from: ${req.last_message_role || 'No messages'}`);
    });
    
    // Query 2: Requests with chat activity where PPID participated
    const chatRequests = await client.query(`
      SELECT DISTINCT r.id, r.status, r.assigned_ppid_id, p.nama as pemohon_nama,
             COUNT(rr.id) as message_count,
             MAX(rr.created_at) as last_message_time,
             (SELECT user_role FROM request_responses WHERE request_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message_role
      FROM requests r
      LEFT JOIN pemohon p ON r.pemohon_id = p.id
      LEFT JOIN request_responses rr ON r.id = rr.request_id
      WHERE r.assigned_ppid_id = $1 AND rr.id IS NOT NULL
      GROUP BY r.id, r.status, r.assigned_ppid_id, p.nama
      ORDER BY MAX(rr.created_at) DESC
    `, [ppidId]);
    
    console.log(`   💬 Requests with chat activity: ${chatRequests.rows.length}`);
    chatRequests.rows.forEach(req => {
      const shouldNotify = req.last_message_role === 'Pemohon';
      console.log(`      - Request ${req.id}: ${req.message_count} messages, last from: ${req.last_message_role} ${shouldNotify ? '🔔 NOTIFY' : ''}`);
    });
    
    // Count unread notifications (last message from Pemohon)
    const unreadCount = chatRequests.rows.filter(req => req.last_message_role === 'Pemohon').length;
    console.log(`   🔔 Total unread notifications: ${unreadCount}`);
    
    // 2. Test the actual API logic simulation
    console.log('\\n🧪 Simulating API /api/chat/unread logic:');
    
    const apiSimulation = await client.query(`
      SELECT r.id, r.status, r.assigned_ppid_id,
             (SELECT user_role FROM request_responses WHERE request_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message_role
      FROM requests r
      WHERE r.assigned_ppid_id = $1 
        AND EXISTS (SELECT 1 FROM request_responses WHERE request_id = r.id)
    `, [ppidId]);
    
    const simulatedUnread = apiSimulation.rows.filter(req => req.last_message_role === 'Pemohon').length;
    console.log(`   📊 Simulated unread count: ${simulatedUnread}`);
    
    // 3. Check for any issues with the current setup
    console.log('\\n🔍 Checking for potential issues:');
    
    // Check if there are requests without proper assignment
    const unassignedForwarded = await client.query(`
      SELECT COUNT(*) as count FROM requests WHERE status = 'Diteruskan' AND assigned_ppid_id IS NULL
    `);
    console.log(`   ⚠️  Unassigned forwarded requests: ${unassignedForwarded.rows[0].count}`);
    
    // Check if there are responses without proper user_name
    const invalidResponses = await client.query(`
      SELECT COUNT(*) as count FROM request_responses WHERE user_name IS NULL OR user_name = ''
    `);
    console.log(`   ⚠️  Invalid responses (missing user_name): ${invalidResponses.rows[0].count}`);
    
    // 4. Provide recommendations
    console.log('\\n💡 Recommendations:');
    if (unreadCount === 0) {
      console.log('   - No unread notifications found. This could be why notifications don\\'t appear.');
      console.log('   - Try adding a new message from a Pemohon to trigger notifications.');
    } else {
      console.log(`   - Found ${unreadCount} unread notifications. Check frontend logic.`);
    }
    
    if (unassignedForwarded.rows[0].count > 0) {
      console.log('   - Assign unassigned forwarded requests to PPID Pelaksana.');
    }
    
    if (invalidResponses.rows[0].count > 0) {
      console.log('   - Fix responses with missing user_name field.');
    }
    
    console.log('\\n✅ Analysis completed!');
    
  } catch (error) {
    console.error('❌ Error analyzing notifications:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixNotificationLogic();