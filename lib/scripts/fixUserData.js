require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function fixUserData() {
  try {
    console.log('🔧 Fixing user data...');

    // Hash password for pemohon123
    const hashedPassword = await bcrypt.hash('pemohon123', 10);
    console.log('Generated hash for pemohon123:', hashedPassword);

    // Update pemohon1 with correct hash
    const { data, error } = await supabase
      .from('pemohon')
      .update({ hashed_password: hashedPassword })
      .eq('email', 'pemohon1@example.com')
      .select();

    if (error) {
      console.error('❌ Error updating pemohon:', error);
      return;
    }

    console.log('✅ Updated pemohon1:', data);

    // Check current pemohon data
    const { data: pemohonData } = await supabase
      .from('pemohon')
      .select('id, email, nama')
      .eq('email', 'pemohon1@example.com')
      .single();

    console.log('✅ Pemohon1 data:', pemohonData);
    console.log('\n🎯 Use these credentials:');
    console.log('Email: pemohon1@example.com');
    console.log('Password: pemohon123');
    console.log('Database ID:', pemohonData?.id);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixUserData();