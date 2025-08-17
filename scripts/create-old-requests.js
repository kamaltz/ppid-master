const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createOldRequests() {
  try {
    console.log('🔍 Finding existing users...');
    
    // Get existing users
    const users = await prisma.user.findMany({
      where: { role: 'PEMOHON' },
      take: 3
    });

    if (users.length === 0) {
      console.log('❌ No pemohon users found. Please create users first.');
      return;
    }

    console.log(`✅ Found ${users.length} pemohon users`);

    const requests = [
      {
        days: 35,
        judul: 'Permohonan Data Kependudukan 2024',
        rincian: 'Meminta data statistik kependudukan Kabupaten Garut tahun 2024 untuk keperluan penelitian akademik'
      },
      {
        days: 28, 
        judul: 'Permohonan Anggaran APBD Sektor Pendidikan',
        rincian: 'Meminta informasi rincian anggaran APBD khusus sektor pendidikan tahun 2024'
      },
      {
        days: 25,
        judul: 'Permohonan Data Infrastruktur Jalan',
        rincian: 'Meminta data pembangunan dan perbaikan infrastruktur jalan kabupaten tahun 2023-2024'
      },
      {
        days: 22,
        judul: 'Permohonan Laporan Kinerja OPD',
        rincian: 'Meminta laporan kinerja Organisasi Perangkat Daerah tahun 2023'
      },
      {
        days: 19,
        judul: 'Permohonan Data Program Bantuan Sosial',
        rincian: 'Meminta data penerima dan realisasi program bantuan sosial di Kabupaten Garut'
      }
    ];

    for (let i = 0; i < requests.length; i++) {
      const user = users[i % users.length];
      const request = requests[i];
      
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - request.days);

      await prisma.permintaan.create({
        data: {
          user_id: user.id,
          nama_lengkap: user.nama || user.email,
          alamat: 'Jl. Sudirman No. 123, Garut',
          pekerjaan: 'Peneliti',
          no_telepon: '081234567890',
          email: user.email,
          judul: request.judul,
          rincian_informasi: request.rincian,
          tujuan_penggunaan: 'Untuk keperluan penelitian dan transparansi publik',
          cara_memperoleh_informasi: 'Email',
          cara_mendapat_salinan: 'Email',
          status: 'Diproses',
          created_at: createdDate,
          updated_at: createdDate
        }
      });

      console.log(`✅ Created: ${request.judul} (${request.days} days ago) for ${user.email}`);
    }

    console.log('\n🎉 Successfully created old requests!');
    console.log('📊 All requests are 17+ days old and eligible for keberatan');
    console.log('🔍 Login as pemohon to test the keberatan form');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOldRequests();