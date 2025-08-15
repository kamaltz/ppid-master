import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function clearCrudData() {
  try {
    console.log('🗑️ Clearing CRUD data (keeping authentication data)...');

    // Clear CRUD tables only (keep user authentication tables)
    await supabase.from('keberatan').delete().neq('id', 0);
    console.log('✅ Keberatan data cleared');
    
    await supabase.from('permintaan_informasi').delete().neq('id', 0);
    console.log('✅ Permintaan informasi data cleared');
    
    await supabase.from('informasi_publik').delete().neq('id', 0);
    console.log('✅ Informasi publik data cleared');

    console.log('\n🎉 CRUD data cleared successfully!');
    console.log('\n📋 Authentication data preserved:');
    console.log('Admin: admin@ppid-garut.go.id / admin123');
    console.log('PPID: ppid.utama@ppid-garut.go.id / ppid123');
    console.log('Atasan: atasan.ppid@ppid-garut.go.id / atasan123');
    console.log('Pemohon: pemohon1@example.com / pemohon123');

  } catch (error) {
    console.error('❌ Error clearing CRUD data:', error);
    process.exit(1);
  }
}

clearCrudData();