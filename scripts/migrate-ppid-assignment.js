const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running PPID assignment migration...');
    
    // Add PPID assignment fields to requests table
    await client.query(`
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS assigned_ppid_id INTEGER;
    `);
    
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'fk_requests_assigned_ppid') THEN
          ALTER TABLE requests ADD CONSTRAINT fk_requests_assigned_ppid 
          FOREIGN KEY (assigned_ppid_id) REFERENCES ppid(id);
        END IF;
      END $$;
    `);
    
    // Add PPID assignment fields to keberatan table  
    await client.query(`
      ALTER TABLE keberatan ADD COLUMN IF NOT EXISTS assigned_ppid_id INTEGER;
    `);
    
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'fk_keberatan_assigned_ppid') THEN
          ALTER TABLE keberatan ADD CONSTRAINT fk_keberatan_assigned_ppid 
          FOREIGN KEY (assigned_ppid_id) REFERENCES ppid(id);
        END IF;
      END $$;
    `);
    
    // Create PPID chat table for inter-PPID communication
    await client.query(`
      CREATE TABLE IF NOT EXISTS ppid_chats (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        attachments TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ppid_chats_sender FOREIGN KEY (sender_id) REFERENCES ppid(id),
        CONSTRAINT fk_ppid_chats_receiver FOREIGN KEY (receiver_id) REFERENCES ppid(id)
      );
    `);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();