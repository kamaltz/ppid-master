import { prisma } from '@/lib/prisma';

export async function getSettings() {
  try {
    const settings = await prisma.setting.findMany();
    
    const settingsObj = settings.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value);
      } catch (error) {
        console.error(`Error parsing setting ${setting.key}:`, error);
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, unknown>);
    
    return settingsObj;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

export async function getGeneralSettings() {
  try {
    const settings = await getSettings();
    return settings.general || {
      namaInstansi: 'PPID Diskominfo Kabupaten Garut',
      logo: '/logo-garut.svg',
      websiteTitle: 'PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik',
      websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.'
    };
  } catch (error) {
    console.error('Error fetching general settings:', error);
    return {
      namaInstansi: 'PPID Diskominfo Kabupaten Garut',
      logo: '/logo-garut.svg',
      websiteTitle: 'PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik',
      websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.'
    };
  }
}