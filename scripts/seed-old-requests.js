const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

      // Use existing pemohon user
      const pemohon = await prisma.pemohon.findUnique({
        where: { email: 'camvr35@gmail.com' }
      });
      
      if (!pemohon) {
        console.log('❌ User camvr35@gmail.com not found. Please register first.');
        continue;
      }

      // Create request using correct model
      await prisma.request.create({
        data: {
          pemohon_id: pemohon.id,
          judul: request.title,
          rincian_informasi: request.info,
          tujuan_penggunaan: 'Untuk keperluan testing sistem keberatan',
          cara_memperoleh_informasi: 'Email',
          cara_mendapat_salinan: 'Email',
          status: 'Diproses',
          created_at: createdDate,
          updated_at: createdDate
        }
      });

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