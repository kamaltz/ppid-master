require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'ppid_garut',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function testConnection() {
  try {
    console.log('🧪 Testing PostgreSQL connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Test tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Tables:', tables.rows.map(r => r.table_name));
    
    // Test data
    const pemohon = await client.query('SELECT COUNT(*) FROM pemohon');
    const requests = await client.query('SELECT COUNT(*) FROM requests');
    
    console.log('📊 Data counts:');
    console.log('  Pemohon:', pemohon.rows[0].count);
    console.log('  Requests:', requests.rows[0].count);
    
    client.release();
    console.log('🎉 PostgreSQL ready!');
    
  } catch (error) {
    console.error('❌ PostgreSQL test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();