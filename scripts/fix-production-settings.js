const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProductionSettings() {
  console.log('Fixing production settings...');
  
  try {
    // Update general settings to use correct paths
    const generalSettings = {
      namaInstansi: "PPID Diskominfo Kabupaten Garut",
      logo: "/logo-garut.svg",
      email: "ppid@garutkab.go.id",
      telepon: "(0262) 123456",
      alamat: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
      websiteTitle: "PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik",
      websiteDescription: "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut."
    };

    await prisma.setting.upsert({
      where: { key: 'general' },
      update: { value: JSON.stringify(generalSettings) },
      create: { key: 'general', value: JSON.stringify(generalSettings) }
    });

    console.log('Production settings updated successfully!');
  } catch (error) {
    console.error('Error updating settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionSettings();