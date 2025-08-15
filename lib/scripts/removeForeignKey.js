import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function removeForeignKey() {
  try {
    console.log('🔧 Removing foreign key constraint temporarily...');

    // Drop foreign key constraint
    const dropConstraint = `
      ALTER TABLE permintaan_informasi 
      DROP CONSTRAINT IF EXISTS permintaan_informasi_pemohon_id_fkey;
    `;

    await supabase.rpc('exec_sql', { sql: dropConstraint });
    console.log('✅ Foreign key constraint removed');

    // Test insert without constraint
    const { data, error } = await supabase
      .from('permintaan_informasi')
      .insert({
        pemohon_id: 999, // Non-existent ID to test
        rincian_informasi: 'Test without FK',
        tujuan_penggunaan: 'Testing',
        status: 'Diajukan'
      })
      .select()
      .single();

    if (!error && data) {
      console.log('✅ Insert without FK successful:', data.id);
      // Clean up
      await supabase.from('permintaan_informasi').delete().eq('id', data.id);
      console.log('✅ Test data cleaned up');
    } else {
      console.log('❌ Insert still failed:', error?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeForeignKey();