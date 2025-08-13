require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createNewTable() {
  try {
    console.log('🔧 Creating new table: requests...');

    const createTable = `
      DROP TABLE IF EXISTS requests CASCADE;
      
      CREATE TABLE requests (
        id SERIAL PRIMARY KEY,
        pemohon_id INTEGER NOT NULL,
        rincian_informasi TEXT NOT NULL,
        tujuan_penggunaan TEXT NOT NULL,
        cara_memperoleh_informasi VARCHAR(100) DEFAULT 'Email',
        cara_mendapat_salinan VARCHAR(100) DEFAULT 'Email',
        status VARCHAR(50) DEFAULT 'Diajukan',
        catatan_ppid TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await supabase.rpc('exec_sql', { sql: createTable });
    console.log('✅ New table "requests" created');

    // Test insert
    const { data, error } = await supabase
      .from('requests')
      .insert({
        pemohon_id: 12,
        rincian_informasi: 'Test new table',
        tujuan_penggunaan: 'Testing new table',
        status: 'Diajukan'
      })
      .select()
      .single();

    if (!error && data) {
      console.log('✅ SUCCESS! New table works:', data);
      console.log('🎉 Now update controller to use "requests" table');
    } else {
      console.log('❌ Failed:', error?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createNewTable();