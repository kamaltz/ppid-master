import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const sampleInformasi = [
  {
    judul: "Pengumuman Layanan Informasi Publik Terbaru",
    klasifikasi: "informasi-berkala",
    ringkasan_isi_informasi: `<p>Dalam rangka meningkatkan transparansi dan akuntabilitas penyelenggaraan pemerintahan, Pemerintah Kabupaten Garut melalui Pejabat Pengelola Informasi dan Dokumentasi (PPID) dengan ini mengumumkan layanan informasi publik terbaru.</p>

<h3>Layanan yang Tersedia:</h3>
<ul>
<li>Permohonan informasi publik secara online</li>
<li>Konsultasi terkait hak akses informasi</li>
<li>Pengajuan keberatan informasi publik</li>
<li>Layanan informasi berkala, serta merta, dan setiap saat</li>
</ul>

<h3>Cara Mengakses:</h3>
<p>Masyarakat dapat mengakses layanan ini melalui website resmi PPID Kabupaten Garut atau datang langsung ke kantor Diskominfo Kabupaten Garut.</p>

<p>Untuk informasi lebih lanjut, silakan hubungi kontak yang tersedia.</p>`,
    pejabat_penguasa_informasi: "PPID Utama Diskominfo"
  },
  {
    judul: "Laporan Kinerja PPID Tahun 2023",
    klasifikasi: "informasi-setiap-saat",
    ringkasan_isi_informasi: `<p>Laporan kinerja PPID Kabupaten Garut tahun 2023 telah selesai disusun dan siap untuk diakses oleh masyarakat.</p>

<h3>Highlights Kinerja 2023:</h3>
<ul>
<li>Total 1,250 permohonan informasi diproses</li>
<li>Tingkat kepuasan masyarakat 95%</li>
<li>Waktu rata-rata penyelesaian 7 hari kerja</li>
<li>100% permohonan ditanggapi sesuai ketentuan</li>
</ul>

<p>Laporan lengkap dapat diunduh melalui file lampiran.</p>`,
    pejabat_penguasa_informasi: "PPID Utama Diskominfo"
  },
  {
    judul: "Prosedur Standar Pelayanan Informasi Publik",
    klasifikasi: "informasi-berkala",
    ringkasan_isi_informasi: `<p>Prosedur Standar Pelayanan (PSP) Informasi Publik di lingkungan Pemerintah Kabupaten Garut telah ditetapkan untuk memberikan pelayanan yang optimal kepada masyarakat.</p>

<h3>Tahapan Pelayanan:</h3>
<ol>
<li>Pengajuan permohonan informasi</li>
<li>Verifikasi dan validasi permohonan</li>
<li>Proses penelaahan informasi</li>
<li>Penyediaan informasi</li>
<li>Penyampaian informasi kepada pemohon</li>
</ol>

<h3>Waktu Pelayanan:</h3>
<p>Maksimal 10 hari kerja sejak permohonan diterima lengkap.</p>`,
    pejabat_penguasa_informasi: "PPID Utama Diskominfo"
  }
];

async function addSampleInformasi() {
  try {
    console.log('🌱 Adding sample informasi data...');
    
    for (const informasi of sampleInformasi) {
      const created = await prisma.informasiPublik.create({
        data: informasi
      });
      console.log(`✅ Added: ${created.judul}`);
    }
    
    console.log(`✅ Successfully added ${sampleInformasi.length} informasi records`);
    
    const count = await prisma.informasiPublik.count();
    console.log(`📊 Total informasi records: ${count}`);
    
  } catch (error) {
    console.error('❌ Error adding informasi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleInformasi();