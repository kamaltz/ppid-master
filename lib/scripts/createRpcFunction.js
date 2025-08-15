import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createRpcFunction() {
  try {
    console.log('🔧 Creating RPC function for inserting permintaan...');

    const createFunction = `
      CREATE OR REPLACE FUNCTION insert_permintaan(
        p_pemohon_id INTEGER,
        p_rincian_informasi TEXT,
        p_tujuan_penggunaan TEXT,
        p_cara_memperoleh_informasi VARCHAR DEFAULT 'Email',
        p_cara_mendapat_salinan VARCHAR DEFAULT 'Email'
      )
      RETURNS JSON AS $$
      DECLARE
        result JSON;
        new_id INTEGER;
      BEGIN
        INSERT INTO permintaan_informasi (
          pemohon_id,
          rincian_informasi,
          tujuan_penggunaan,
          cara_memperoleh_informasi,
          cara_mendapat_salinan,
          status,
          tanggal_permintaan,
          created_at
        ) VALUES (
          p_pemohon_id,
          p_rincian_informasi,
          p_tujuan_penggunaan,
          p_cara_memperoleh_informasi,
          p_cara_mendapat_salinan,
          'Diajukan',
          NOW(),
          NOW()
        ) RETURNING id INTO new_id;
        
        SELECT json_build_object(
          'success', true,
          'id', new_id,
          'message', 'Permintaan berhasil dibuat'
        ) INTO result;
        
        RETURN result;
      EXCEPTION
        WHEN OTHERS THEN
          SELECT json_build_object(
            'success', false,
            'error', SQLERRM,
            'code', SQLSTATE
          ) INTO result;
          RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await supabase.rpc('exec_sql', { sql: createFunction });
    console.log('✅ RPC function created successfully');

    // Test the function
    console.log('🧪 Testing RPC function...');
    const { data: testResult, error } = await supabase.rpc('insert_permintaan', {
      p_pemohon_id: 1,
      p_rincian_informasi: 'Test RPC function',
      p_tujuan_penggunaan: 'Testing purpose',
      p_cara_memperoleh_informasi: 'Email',
      p_cara_mendapat_salinan: 'Email'
    });

    if (error) {
      console.error('❌ RPC test failed:', error);
    } else {
      console.log('✅ RPC test result:', testResult);
    }

    console.log('\n🎉 RPC function ready for use!');
    
  } catch (error) {
    console.error('❌ Error creating RPC function:', error);
    process.exit(1);
  }
}

createRpcFunction();