const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createKeberatanTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating keberatan table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS keberatan (
        id SERIAL PRIMARY KEY,
        permintaan_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
        pemohon_id INTEGER NOT NULL REFERENCES pemohon(id) ON DELETE CASCADE,
        alasan_keberatan TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Diajukan',
        catatan_ppid TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Keberatan table created successfully!');
    
    // Create trigger for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_keberatan_updated_at ON keberatan;
      CREATE TRIGGER update_keberatan_updated_at
        BEFORE UPDATE ON keberatan
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('Keberatan table triggers created successfully!');
    
  } catch (error) {
    console.error('Error creating keberatan table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createKeberatanTable();