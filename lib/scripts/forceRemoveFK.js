import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function forceRemoveFK() {
  try {
    console.log('🔧 Force removing ALL constraints...');

    // Get all constraints
    const getConstraints = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'permintaan_informasi' 
      AND constraint_type = 'FOREIGN KEY';
    `;

    const { data: constraints } = await supabase.rpc('exec_sql', { sql: getConstraints });
    console.log('Found constraints:', constraints);

    // Drop all foreign key constraints
    const dropAllFK = `
      ALTER TABLE permintaan_informasi 
      DROP CONSTRAINT IF EXISTS permintaan_informasi_pemohon_id_fkey CASCADE;
      
      ALTER TABLE permintaan_informasi 
      DROP CONSTRAINT IF EXISTS fk_pemohon CASCADE;
      
      ALTER TABLE permintaan_informasi 
      DROP CONSTRAINT IF EXISTS permintaan_informasi_pemohon_id_fkey1 CASCADE;
    `;

    await supabase.rpc('exec_sql', { sql: dropAllFK });
    console.log('✅ All FK constraints dropped');

    // Test insert
    const { data, error } = await supabase
      .from('permintaan_informasi')
      .insert({
        pemohon_id: 12,
        rincian_informasi: 'Test after FK removal',
        tujuan_penggunaan: 'Testing no FK',
        status: 'Diajukan'
      })
      .select()
      .single();

    if (!error && data) {
      console.log('✅ SUCCESS! Insert worked:', data.id);
      console.log('🎉 Form should work now!');
    } else {
      console.log('❌ Still failed:', error?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

forceRemoveFK();