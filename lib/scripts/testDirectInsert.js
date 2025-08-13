require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testDirectInsert() {
  try {
    console.log('🧪 Testing direct insert to requests table...');

    const { data, error } = await supabase
      .from('requests')
      .insert({
        pemohon_id: 12,
        rincian_informasi: 'Final test insert',
        tujuan_penggunaan: 'Final testing',
        cara_memperoleh_informasi: 'Email',
        cara_mendapat_salinan: 'Email',
        status: 'Diajukan'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Insert failed:', error);
    } else {
      console.log('✅ SUCCESS! Insert worked:', data);
      console.log('🎉 Form should work now!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDirectInsert();