const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedOldRequests() {
  try {
    console.log('🌱 Creating test requests with various ages...');

    const testRequests = [
      {
        // 25 working days ago (eligible for keberatan)
        days: 35,
        title: 'Permohonan Data Kependudukan 2024',
        info: 'Meminta data statistik kependudukan Kabupaten Garut tahun 2024'
      },
      {
        // 20 working days ago (eligible for keberatan)
        days: 28,
        title: 'Permohonan Anggaran APBD',
        info: 'Meminta informasi rincian anggaran APBD tahun 2024'
      },
      {
        // 18 working days ago (eligible for keberatan)
        days: 25,
        title: 'Permohonan Data Infrastruktur',
        info: 'Meminta data pembangunan infrastruktur jalan kabupaten'
      },
      {
        // 10 working days ago (not eligible yet)
        days: 14,
        title: 'Permohonan Data Pendidikan',
        info: 'Meminta data sekolah dan siswa di Kabupaten Garut'
      },
      {
        // 5 working days ago (not eligible yet)
        days: 7,
        title: 'Permohonan Data Kesehatan',
        info: 'Meminta data fasilitas kesehatan dan tenaga medis'
      }
    ];

    for (const request of testRequests) {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - request.days);

      const result = await prisma.$executeRaw`
        INSERT INTO permintaan (
          nama_lengkap, alamat, pekerjaan, no_telepon, email, judul,
          rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi,
          cara_mendapat_salinan, status, created_at, updated_at
        ) VALUES (
          'Test User Keberatan',
          'Jl. Test No. 123, Garut',
          'Tester',
          '081234567890',
          'test.keberatan@example.com',
          ${request.title},
          ${request.info},
          'Untuk keperluan testing sistem keberatan',
          'Email',
          'Email',
          'Diproses',
          ${createdDate},
          ${createdDate}
        )
      `;
      
      /*await prisma.permintaan.create({
        data: {
          nama_lengkap: 'Test User Keberatan',
          alamat: 'Jl. Test No. 123, Garut',
          pekerjaan: 'Tester',
          no_telepon: '081234567890',
          email: 'test.keberatan@example.com',
          judul: request.title,
          rincian_informasi: request.info,
          tujuan_penggunaan: 'Untuk keperluan testing sistem keberatan',
          cara_memperoleh_informasi: 'Email',
          cara_mendapat_salinan: 'Email',
          status: 'Diproses',
          created_at: createdDate,
          updated_at: createdDate
        }
      });*/

      console.log(`✅ Created request: ${request.title} (${request.days} days ago)`);
    }

    console.log('🎉 Successfully created test requests for keberatan testing!');
    console.log('\n📊 Summary:');
    console.log('- 3 requests eligible for keberatan (17+ working days)');
    console.log('- 2 requests not yet eligible (< 17 working days)');
    console.log('\n🔍 You can now test the keberatan form to see the working days validation.');

  } catch (error) {
    console.error('❌ Error creating test requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedOldRequests();