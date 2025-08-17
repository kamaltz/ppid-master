import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const categories = ['informasi-berkala', 'informasi-serta-merta', 'informasi-setiap-saat'];

const generateInformasi = () => {
  const data = [];
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  
  years.forEach((year, yearIndex) => {
    for (let i = 1; i <= 5; i++) {
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(year, month - 1, day);
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      data.push({
        judul: `Informasi Publik Tahun ${year} - Dokumen ${i}`,
        klasifikasi: category,
        ringkasan_isi_informasi: `Dokumen informasi publik tahun ${year} nomor ${i}. Berisi informasi penting mengenai layanan dan program pemerintah Kabupaten Garut untuk tahun ${year}.`,
        tanggal_posting: date.toISOString(),
        pejabat_penguasa_informasi: 'PPID Diskominfo'
      });
    }
  });
  
  return data.sort((a, b) => new Date(b.tanggal_posting) - new Date(a.tanggal_posting));
};

async function batchAddInformasi() {
  try {
    console.log('🚀 Starting batch add informasi 2020-2025...');
    
    const informasiData = generateInformasi();
    console.log(`📝 Generated ${informasiData.length} informasi records (5 per year: 2020-2025)`);
    
    let count = 0;
    for (const informasi of informasiData) {
      await prisma.informasiPublik.create({ data: informasi });
      count++;
      if (count % 10 === 0) {
        console.log(`✅ Added ${count}/${informasiData.length} records...`);
      }
    }
    
    console.log(`✅ Successfully added ${count} informasi records`);
    
    const total = await prisma.informasiPublik.count();
    console.log(`📊 Total informasi records in database: ${total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

batchAddInformasi();