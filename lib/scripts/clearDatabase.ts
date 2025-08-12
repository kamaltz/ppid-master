import { supabase } from '../lib/supabaseClient';

async function clearDatabase() {
  try {
    console.log('🗑️ Clearing database...');

    // Clear all tables in order (respecting foreign key constraints)
    await supabase.from('keberatan').delete().neq('id', 0);
    await supabase.from('permintaan_informasi').delete().neq('id', 0);
    await supabase.from('informasi_publik').delete().neq('id', 0);
    await supabase.from('pemohon').delete().neq('id', 0);
    await supabase.from('atasan_ppid').delete().neq('no_pengawas', '');
    await supabase.from('ppid').delete().neq('no_pegawai', '');
    await supabase.from('admin').delete().neq('id', 0);

    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

if (require.main === module) {
  clearDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default clearDatabase;