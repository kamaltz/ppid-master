import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const sampleRequests = [
  {
    rincian_informasi: 'Data anggaran pembangunan jalan tahun 2024',
    tujuan_penggunaan: 'Penelitian akademik',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Email',
    status: 'Diajukan'
  },
  {
    rincian_informasi: 'Laporan keuangan daerah semester 1 tahun 2024',
    tujuan_penggunaan: 'Monitoring transparansi',
    cara_memperoleh_informasi: 'Mengambil Langsung',
    cara_mendapat_salinan: 'Mengambil Langsung',
    status: 'Diproses'
  },
  {
    rincian_informasi: 'Data jumlah penduduk per kecamatan',
    tujuan_penggunaan: 'Analisis demografi',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Email',
    status: 'Selesai'
  },
  {
    rincian_informasi: 'Dokumen RPJMD Kabupaten Garut 2023-2028',
    tujuan_penggunaan: 'Studi kebijakan publik',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Pos',
    status: 'Diajukan'
  },
  {
    rincian_informasi: 'Data realisasi PAD tahun 2023',
    tujuan_penggunaan: 'Analisis ekonomi daerah',
    cara_memperoleh_informasi: 'Mengambil Langsung',
    cara_mendapat_salinan: 'Email',
    status: 'Ditolak'
  },
  {
    rincian_informasi: 'Informasi tender proyek infrastruktur 2024',
    tujuan_penggunaan: 'Monitoring pengadaan',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Email',
    status: 'Diproses'
  },
  {
    rincian_informasi: 'Data kepegawaian ASN di lingkungan Pemkab Garut',
    tujuan_penggunaan: 'Penelitian SDM',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Fax',
    status: 'Diajukan'
  },
  {
    rincian_informasi: 'Laporan kinerja OPD tahun 2023',
    tujuan_penggunaan: 'Evaluasi kinerja',
    cara_memperoleh_informasi: 'Mengambil Langsung',
    cara_mendapat_salinan: 'Mengambil Langsung',
    status: 'Selesai'
  },
  {
    rincian_informasi: 'Data program bantuan sosial tahun 2024',
    tujuan_penggunaan: 'Monitoring program sosial',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Email',
    status: 'Diajukan'
  },
  {
    rincian_informasi: 'Dokumen peraturan daerah terbaru',
    tujuan_penggunaan: 'Studi hukum',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Pos',
    status: 'Diproses'
  }
];

async function main() {
  console.log('🚀 Starting bulk request seeding...');

  try {
    // Get first pemohon
    const pemohon = await prisma.pemohon.findFirst();
    if (!pemohon) {
      console.log('❌ No pemohon found. Please run seed first.');
      return;
    }

    console.log(`📝 Creating ${sampleRequests.length} sample requests...`);

    const createdRequests = [];
    for (const requestData of sampleRequests) {
      const request = await prisma.request.create({
        data: {
          pemohon_id: pemohon.id,
          ...requestData
        }
      });
      createdRequests.push(request);
    }

    console.log('✅ Bulk request seeding completed!');
    console.log(`📊 Created ${createdRequests.length} requests with status distribution:`);
    
    const statusCount = createdRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    console.log('┌─────────────┬───────┐');
    console.log('│ Status      │ Count │');
    console.log('├─────────────┼───────┤');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`│ ${status.padEnd(11)} │ ${count.toString().padStart(5)} │`);
    });
    console.log('└─────────────┴───────┘');

  } catch (error) {
    console.error('❌ Bulk request seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });