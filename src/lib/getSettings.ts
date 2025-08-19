import { prisma } from '@/lib/prisma';

export async function getSettings() {
  try {
    // Check if we're in build time or database is unavailable
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return {};
    }
    
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
  const defaultSettings = {
    namaInstansi: 'PPID Diskominfo Kabupaten Garut',
    logo: '/logo-garut.svg',
    websiteTitle: 'PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik',
    websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.'
  };
  
  try {
    // Return defaults immediately if no database connection
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return defaultSettings;
    }
    
    const settings = await getSettings();
    return settings.general || defaultSettings;
  } catch (error) {
    console.error('Error fetching general settings:', error);
    return defaultSettings;
  }
}