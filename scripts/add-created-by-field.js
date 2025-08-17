const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addCreatedByField() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding created_by field to informasi_publik table...');
    
    // Check if column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'informasi_publik' AND column_name = 'created_by'
    `);
    
    if (columnCheck.rows.length === 0) {
      // Add created_by column
      await client.query(`
        ALTER TABLE informasi_publik ADD COLUMN created_by INTEGER;
      `);
      
      // Add foreign key constraint
      await client.query(`
        ALTER TABLE informasi_publik ADD CONSTRAINT fk_informasi_created_by 
        FOREIGN KEY (created_by) REFERENCES ppid(id);
      `);
      
      console.log('✅ created_by field added successfully');
    } else {
      console.log('✅ created_by field already exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addCreatedByField();