require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function fixUserIdMismatch() {
  try {
    console.log('🔧 Fixing user ID mismatch...');

    // Check current pemohon data
    const { data: pemohonData } = await supabase
      .from('pemohon')
      .select('*')
      .eq('email', 'pemohon1@example.com');

    console.log('Current pemohon data:', pemohonData);

    if (pemohonData && pemohonData.length > 0) {
      const correctId = pemohonData[0].id;
      console.log('Correct pemohon ID:', correctId);

      // Test insert with correct ID
      const { data, error } = await supabase
        .from('permintaan_informasi')
        .insert({
          pemohon_id: correctId,
          rincian_informasi: 'Test with correct ID',
          tujuan_penggunaan: 'Testing correct ID',
          status: 'Diajukan'
        })
        .select()
        .single();

      if (!error && data) {
        console.log('✅ Insert successful with correct ID:', data.id);
        console.log('🎯 Use pemohon ID:', correctId);
      } else {
        console.log('❌ Insert failed:', error?.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixUserIdMismatch();