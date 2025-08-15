import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createSimpleTable() {
  try {
    console.log('🔧 Creating simple permintaan table without FK...');

    // Drop and recreate table without foreign key
    const createTable = `
      DROP TABLE IF EXISTS permintaan_informasi CASCADE;
      
      CREATE TABLE permintaan_informasi (
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
    console.log('✅ Simple table created');

    // Test insert
    const { data, error } = await supabase
      .from('permintaan_informasi')
      .insert({
        pemohon_id: 1,
        rincian_informasi: 'Test simple table',
        tujuan_penggunaan: 'Testing',
        status: 'Diajukan'
      })
      .select()
      .single();

    if (!error && data) {
      console.log('✅ Insert successful:', data);
      console.log('🎉 Table ready for form submission!');
    } else {
      console.log('❌ Insert failed:', error?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSimpleTable();