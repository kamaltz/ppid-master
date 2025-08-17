const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixKeberatanSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing keberatan schema...');
    
    // Check if assigned_ppid_id column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'keberatan' AND column_name = 'assigned_ppid_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('➕ Adding assigned_ppid_id column to keberatan table...');
      
      await client.query(`
        ALTER TABLE keberatan ADD COLUMN assigned_ppid_id INTEGER;
      `);
      
      await client.query(`
        ALTER TABLE keberatan ADD CONSTRAINT fk_keberatan_assigned_ppid 
        FOREIGN KEY (assigned_ppid_id) REFERENCES ppid(id);
      `);
      
      console.log('✅ Column added successfully');
    } else {
      console.log('✅ Column already exists');
    }
    
    // Check current keberatan structure
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'keberatan'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Current keberatan table structure:');
    structure.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixKeberatanSchema();