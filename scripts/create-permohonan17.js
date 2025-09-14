const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createOldRequest() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Usage: npm run create-keberatan <email> <password>');
    console.log('📝 Example: npm run create-keberatan user@example.com password123');
    process.exit(1);
  }

  const [email, password] = args;

  try {
    console.log('🔍 Mencari pemohon dengan email:', email);
    
    // Find pemohon by email and verify password
    const pemohon = await prisma.pemohon.findUnique({
      where: { email }
    });

    if (!pemohon) {
      console.log('❌ Pemohon tidak ditemukan dengan email:', email);
      process.exit(1);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, pemohon.hashed_password);
    if (!isValidPassword) {
      console.log('❌ Password salah untuk email:', email);
      process.exit(1);
    }

    console.log('✅ Pemohon ditemukan:', pemohon.nama);

    // Create request that is older than 17 working days (eligible for keberatan)
    // Calculate 25 calendar days ago to ensure 17+ working days
    function getWorkingDaysAgo(workingDays) {
      const date = new Date();
      let daysToSubtract = 0;
      let workingDaysCount = 0;
      
      while (workingDaysCount < workingDays) {
        daysToSubtract++;
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - daysToSubtract);
        const dayOfWeek = checkDate.getDay();
        
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDaysCount++;
        }
      }
      
      date.setDate(date.getDate() - daysToSubtract);
      return date;
    }
    
    const oldRequestDate = getWorkingDaysAgo(18); // 18 working days ago

    const request = await prisma.request.create({
      data: {
        pemohon_id: pemohon.id,
        judul: 'Permohonan Informasi untuk Testing Keberatan',
        rincian_informasi: 'Permohonan informasi publik terkait data anggaran dan laporan keuangan daerah tahun 2024. Informasi ini diperlukan untuk kepentingan penelitian dan transparansi publik.',
        tujuan_penggunaan: 'Untuk kepentingan penelitian akademik dan transparansi publik',
        cara_memperoleh_informasi: 'Email',
        cara_mendapat_salinan: 'Email',
        status: 'Diproses',
        created_at: oldRequestDate,
        updated_at: oldRequestDate
      }
    });

    console.log('✅ Permohonan berhasil dibuat!');
    console.log('📄 Detail Permohonan:');
    console.log(`   ID Permohonan: ${request.id}`);
    console.log(`   Pemohon: ${pemohon.nama} (${pemohon.email})`);
    console.log(`   Status: ${request.status}`);
    console.log(`   Tanggal Dibuat: ${request.created_at.toLocaleString('id-ID')}`);
    console.log(`   Judul: ${request.judul}`);
    
    // Calculate working days difference
    function calculateWorkingDays(startDate, endDate) {
      let workingDays = 0;
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return workingDays;
    }
    
    const workingDaysDiff = calculateWorkingDays(new Date(request.created_at), new Date());
    const calendarDaysDiff = Math.floor((new Date() - new Date(request.created_at)) / (1000 * 60 * 60 * 24));
    
    console.log(`   Umur Permohonan: ${calendarDaysDiff} hari kalender (${workingDaysDiff} hari kerja)`);
    
    if (workingDaysDiff >= 17) {
      console.log('✅ Permohonan ini sudah memenuhi syarat untuk mengajukan keberatan (>17 hari kerja)');
    } else {
      console.log('⚠️ Permohonan ini belum memenuhi syarat untuk keberatan');
    }



  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createOldRequest();