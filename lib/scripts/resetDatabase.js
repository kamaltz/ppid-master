require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function clearDatabase() {
  console.log('🗑️ Clearing database...');
  
  await supabase.from('keberatan').delete().neq('id', 0);
  await supabase.from('permintaan_informasi').delete().neq('id', 0);
  await supabase.from('informasi_publik').delete().neq('id', 0);
  await supabase.from('pemohon').delete().neq('id', 0);
  await supabase.from('atasan_ppid').delete().neq('no_pengawas', '');
  await supabase.from('ppid').delete().neq('no_pegawai', '');
  await supabase.from('admin').delete().neq('id', 0);
  
  console.log('✅ Database cleared');
}

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const { data: admin } = await supabase
    .from('admin')
    .insert([{
      email: 'admin@ppid-garut.go.id',
      hashed_password: adminPassword,
      nama: 'Administrator PPID'
    }])
    .select()
    .single();

  // PPID
  const ppidPassword = await bcrypt.hash('ppid123', 10);
  await supabase
    .from('ppid')
    .insert([
      {
        no_pegawai: 'PPID001',
        email: 'ppid.utama@ppid-garut.go.id',
        hashed_password: ppidPassword,
        nama: 'PPID Utama',
        role: 'PPID'
      },
      {
        no_pegawai: 'PPID002',
        email: 'ppid.pelaksana@ppid-garut.go.id',
        hashed_password: ppidPassword,
        nama: 'PPID Pelaksana',
        role: 'PPID_Pelaksana'
      }
    ]);

  // Atasan PPID
  const atasanPassword = await bcrypt.hash('atasan123', 10);
  await supabase
    .from('atasan_ppid')
    .insert([{
      no_pengawas: 'ATN001',
      email: 'atasan.ppid@ppid-garut.go.id',
      hashed_password: atasanPassword,
      nama: 'Atasan PPID'
    }]);

  // Pemohon
  const pemohonPassword = await bcrypt.hash('pemohon123', 10);
  const { data: pemohon } = await supabase
    .from('pemohon')
    .insert([
      {
        email: 'pemohon1@example.com',
        hashed_password: pemohonPassword,
        nama: 'Ahmad Rizki',
        no_telepon: '081234567890',
        alamat: 'Jl. Merdeka No. 123, Garut'
      },
      {
        email: 'pemohon2@example.com',
        hashed_password: pemohonPassword,
        nama: 'Siti Nurhaliza',
        no_telepon: '081234567891',
        alamat: 'Jl. Sudirman No. 456, Garut'
      }
    ])
    .select();

  // Informasi Publik
  await supabase
    .from('informasi_publik')
    .insert([
      {
        judul: 'Profil Singkat PPID Garut',
        klasifikasi: 'Informasi Berkala',
        ringkasan_isi_informasi: 'Profil dan struktur organisasi PPID Kabupaten Garut',
        pejabat_penguasa_informasi: 'Kepala Dinas Komunikasi dan Informatika'
      },
      {
        judul: 'Daftar Informasi Publik 2024',
        klasifikasi: 'Informasi Berkala',
        ringkasan_isi_informasi: 'Daftar lengkap informasi publik yang tersedia tahun 2024',
        pejabat_penguasa_informasi: 'PPID Utama'
      }
    ]);

  // Permintaan Informasi
  if (pemohon && pemohon.length > 0) {
    const { data: permintaan } = await supabase
      .from('permintaan_informasi')
      .insert([
        {
          pemohon_id: pemohon[0].id,
          rincian_informasi: 'Data anggaran daerah Kabupaten Garut tahun 2024',
          tujuan_penggunaan: 'Untuk penelitian akademik',
          cara_memperoleh_informasi: 'Mendapat Salinan',
          cara_mendapat_salinan: 'Email',
          status: 'Diajukan',
          tanggal_permintaan: new Date().toISOString()
        }
      ])
      .select();

    // Keberatan
    if (permintaan && permintaan.length > 0) {
      await supabase
        .from('keberatan')
        .insert([
          {
            pemohon_id: pemohon[1].id,
            permintaan_id: permintaan[0].id,
            alasan_keberatan: 'Permintaan tidak ditanggapi dalam waktu yang ditentukan',
            status: 'Diajukan',
            tanggal_keberatan: new Date().toISOString()
          }
        ]);
    }
  }

  console.log('✅ Database seeded');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@ppid-garut.go.id / admin123');
  console.log('PPID: ppid.utama@ppid-garut.go.id / ppid123');
  console.log('Atasan: atasan.ppid@ppid-garut.go.id / atasan123');
  console.log('Pemohon: pemohon1@example.com / pemohon123');
}

async function resetDatabase() {
  try {
    await clearDatabase();
    await seedDatabase();
    console.log('\n🎉 Database reset completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetDatabase();