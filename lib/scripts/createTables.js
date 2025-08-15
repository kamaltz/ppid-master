import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createTables() {
  try {
    console.log('🔧 Creating database tables...');

    // Drop existing tables if they exist
    console.log('Dropping existing tables...');
    try {
      await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS keberatan CASCADE;' });
    } catch { console.log('keberatan table not found, skipping...'); }
    
    try {
      await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS permintaan_informasi CASCADE;' });
    } catch { console.log('permintaan_informasi table not found, skipping...'); }

    // Create permintaan_informasi table
    console.log('Creating permintaan_informasi table...');
    const createPermintaanTable = `
      CREATE TABLE permintaan_informasi (
        id SERIAL PRIMARY KEY,
        pemohon_id INTEGER REFERENCES pemohon(id) ON DELETE CASCADE,
        rincian_informasi TEXT NOT NULL,
        tujuan_penggunaan TEXT NOT NULL,
        cara_memperoleh_informasi VARCHAR(50) DEFAULT 'Email',
        cara_mendapat_salinan VARCHAR(50) DEFAULT 'Email',
        status VARCHAR(20) DEFAULT 'Diajukan',
        tanggal_permintaan TIMESTAMP DEFAULT NOW(),
        tanggal_diproses TIMESTAMP,
        tanggal_selesai TIMESTAMP,
        tanggal_ditolak TIMESTAMP,
        catatan_ppid TEXT,
        estimasi_waktu INTEGER,
        biaya DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await supabase.rpc('exec_sql', { sql: createPermintaanTable });
    console.log('✅ permintaan_informasi table created');

    // Create keberatan table
    console.log('Creating keberatan table...');
    const createKeberatanTable = `
      CREATE TABLE keberatan (
        id SERIAL PRIMARY KEY,
        pemohon_id INTEGER REFERENCES pemohon(id) ON DELETE CASCADE,
        permintaan_id INTEGER REFERENCES permintaan_informasi(id) ON DELETE CASCADE,
        alasan_keberatan TEXT NOT NULL,
        kasus_posisi TEXT,
        status VARCHAR(20) DEFAULT 'Diajukan',
        tanggal_keberatan TIMESTAMP DEFAULT NOW(),
        tanggal_diproses TIMESTAMP,
        tanggal_selesai TIMESTAMP,
        tanggapan_atasan TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await supabase.rpc('exec_sql', { sql: createKeberatanTable });
    console.log('✅ keberatan table created');

    // Create indexes
    console.log('Creating indexes...');
    await supabase.rpc('exec_sql', { 
      sql: 'CREATE INDEX idx_permintaan_pemohon ON permintaan_informasi(pemohon_id);' 
    });
    await supabase.rpc('exec_sql', { 
      sql: 'CREATE INDEX idx_permintaan_status ON permintaan_informasi(status);' 
    });
    await supabase.rpc('exec_sql', { 
      sql: 'CREATE INDEX idx_keberatan_pemohon ON keberatan(pemohon_id);' 
    });
    await supabase.rpc('exec_sql', { 
      sql: 'CREATE INDEX idx_keberatan_permintaan ON keberatan(permintaan_id);' 
    });

    console.log('✅ Indexes created');
    console.log('\n🎉 Database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables();