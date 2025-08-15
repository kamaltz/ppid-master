import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // 1. Seed Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await supabase
      .from('admin')
      .insert([{
        email: 'admin@ppid-garut.go.id',
        hashed_password: adminPassword,
        nama: 'Administrator PPID'
      }])
      .select()
      .single();
    console.log('✅ Admin created');

    // 2. Seed PPID
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
      ])
      .select();
    console.log('✅ PPID users created');

    // 3. Seed Atasan PPID
    const atasanPassword = await bcrypt.hash('atasan123', 10);
    await supabase
      .from('atasan_ppid')
      .insert([{
        no_pengawas: 'ATN001',
        email: 'atasan.ppid@ppid-garut.go.id',
        hashed_password: atasanPassword,
        nama: 'Atasan PPID'
      }])
      .select()
      .single();
    console.log('✅ Atasan PPID created');

    // 4. Seed Pemohon
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
    console.log('✅ Pemohon users created');

    // 5. Seed Informasi Publik
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
        },
        {
          judul: 'Prosedur Permohonan Informasi',
          klasifikasi: 'Informasi Setiap Saat',
          ringkasan_isi_informasi: 'Tata cara dan prosedur mengajukan permohonan informasi publik',
          pejabat_penguasa_informasi: 'PPID Utama'
        }
      ])
      .select();
    console.log('✅ Informasi publik created');

    // 6. Seed Permintaan Informasi
    if (pemohon && pemohon.length >= 2) {
      const { data: permintaan } = await supabase
        .from('permintaan_informasi')
        .insert([
          {
            pemohon_id: pemohon[0].id,
            rincian_informasi: 'Data anggaran daerah Kabupaten Garut tahun 2024',
            tujuan_penggunaan: 'Untuk penelitian akademik tentang transparansi anggaran daerah',
            cara_memperoleh_informasi: 'Mendapat Salinan',
            cara_mendapat_salinan: 'Email',
            status: 'Diajukan',
            tanggal_permintaan: new Date().toISOString()
          },
          {
            pemohon_id: pemohon[1].id,
            rincian_informasi: 'Laporan kinerja SKPD tahun 2023',
            tujuan_penggunaan: 'Untuk monitoring dan evaluasi program pemerintah',
            cara_memperoleh_informasi: 'Melihat/Membaca',
            cara_mendapat_salinan: 'Mengambil Langsung',
            status: 'Diproses',
            tanggal_permintaan: new Date(Date.now() - 86400000).toISOString(),
            tanggal_diproses: new Date().toISOString(),
            catatan_ppid: 'Sedang diproses oleh tim PPID',
            estimasi_waktu: '7 hari kerja'
          },
          {
            pemohon_id: pemohon[0].id,
            rincian_informasi: 'Data statistik penduduk Garut 2024',
            tujuan_penggunaan: 'Untuk penyusunan proposal usaha',
            cara_memperoleh_informasi: 'Mendapat Salinan',
            cara_mendapat_salinan: 'Email',
            status: 'Selesai',
            tanggal_permintaan: new Date(Date.now() - 172800000).toISOString(),
            tanggal_diproses: new Date(Date.now() - 86400000).toISOString(),
            tanggal_selesai: new Date().toISOString(),
            catatan_ppid: 'Informasi telah dikirim via email'
          }
        ])
        .select();
      console.log('✅ Permintaan informasi created');

      // 7. Seed Keberatan
      if (permintaan && permintaan.length > 0) {
        await supabase
          .from('keberatan')
          .insert([
            {
              pemohon_id: pemohon[1].id,
              permintaan_id: permintaan[0].id,
              alasan_keberatan: 'Permintaan informasi tidak ditanggapi dalam batas waktu yang ditentukan',
              kasus_posisi: 'Telah mengajukan permohonan informasi sejak 2 minggu lalu namun belum ada tanggapan dari PPID',
              status: 'Diajukan',
              tanggal_keberatan: new Date().toISOString()
            }
          ])
          .select();
        console.log('✅ Keberatan created');
      }
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@ppid-garut.go.id / admin123');
    console.log('PPID Utama: ppid.utama@ppid-garut.go.id / ppid123');
    console.log('PPID Pelaksana: ppid.pelaksana@ppid-garut.go.id / ppid123');
    console.log('Atasan PPID: atasan.ppid@ppid-garut.go.id / atasan123');
    console.log('Pemohon 1: pemohon1@example.com / pemohon123');
    console.log('Pemohon 2: pemohon2@example.com / pemohon123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;