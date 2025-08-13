require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createCorrectUser() {
  try {
    console.log('🔧 Creating user with ID 12...');

    // Hash password
    const hashedPassword = await bcrypt.hash('pemohon123', 10);

    // Insert pemohon with specific ID
    const insertSql = `
      INSERT INTO pemohon (id, email, hashed_password, nama, no_telepon, alamat) 
      VALUES (12, 'test@example.com', '${hashedPassword}', 'Test User', '081234567890', 'Test Address')
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        hashed_password = EXCLUDED.hashed_password,
        nama = EXCLUDED.nama;
    `;

    await supabase.rpc('exec_sql', { sql: insertSql });
    console.log('✅ User with ID 12 created/updated');

    // Test insert with ID 12
    const { data, error } = await supabase
      .from('permintaan_informasi')
      .insert({
        pemohon_id: 12,
        rincian_informasi: 'Test with ID 12',
        tujuan_penggunaan: 'Testing ID 12',
        status: 'Diajukan'
      })
      .select()
      .single();

    if (!error && data) {
      console.log('✅ Insert successful with ID 12:', data.id);
      console.log('🎯 Use credentials:');
      console.log('Email: test@example.com');
      console.log('Password: pemohon123');
    } else {
      console.log('❌ Insert failed:', error?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createCorrectUser();