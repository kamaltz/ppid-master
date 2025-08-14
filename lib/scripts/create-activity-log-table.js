const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createActivityLogTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating activity_logs table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        user_id VARCHAR(50),
        user_role VARCHAR(50),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Activity logs table created successfully!');
    
  } catch (error) {
    console.error('Error creating activity logs table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createActivityLogTable();