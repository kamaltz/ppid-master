import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSettings() {
  try {
    console.log('🌱 Seeding settings...');

    // Default general settings
    await prisma.setting.upsert({
      where: { key: 'general' },
      update: {},
      create: {
        key: 'general',
        value: JSON.stringify({
          namaInstansi: 'PPID Diskominfo Kabupaten Garut',
          logo: '/logo-garut.svg',
          email: 'ppid@garutkab.go.id',
          telepon: '(0262) 232123',
          alamat: 'Jl. Pembangunan No. 64, Garut, Jawa Barat',
          websiteTitle: 'PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik',
          websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.'
        })
      }
    });

    // Default header settings
    await prisma.setting.upsert({
      where: { key: 'header' },
      update: {},
      create: {
        key: 'header',
        value: JSON.stringify({
          menuItems: [
            {
              label: 'Beranda',
              url: '/',
              hasDropdown: false,
              dropdownItems: []
            },
            {
              label: 'Profil PPID',
              url: '/profil',
              hasDropdown: false,
              dropdownItems: []
            },
            {
              label: 'Informasi Publik',
              url: '/informasi',
              hasDropdown: true,
              dropdownItems: [
                { label: 'Daftar Informasi Publik', url: '/informasi' },
                { label: 'DIP', url: '/dip' }
              ]
            },
            {
              label: 'Layanan',
              url: '/permohonan',
              hasDropdown: true,
              dropdownItems: [
                { label: 'Permohonan Informasi', url: '/permohonan' },
                { label: 'Keberatan', url: '/pemohon/keberatan' }
              ]
            }
          ]
        })
      }
    });

    // Default footer settings
    await prisma.setting.upsert({
      where: { key: 'footer' },
      update: {},
      create: {
        key: 'footer',
        value: JSON.stringify({
          socialMedia: {
            facebook: 'https://facebook.com/garutkab',
            twitter: 'https://twitter.com/garutkab',
            instagram: 'https://instagram.com/garutkab',
            youtube: 'https://youtube.com/garutkab'
          },
          quickLinks: [
            { label: 'Beranda', url: '/' },
            { label: 'Profil PPID', url: '/profil' },
            { label: 'Informasi Publik', url: '/informasi' },
            { label: 'Permohonan', url: '/permohonan' }
          ]
        })
      }
    });

    // Default hero settings
    await prisma.setting.upsert({
      where: { key: 'hero' },
      update: {},
      create: {
        key: 'hero',
        value: JSON.stringify({
          title: 'Selamat Datang di PPID Diskominfo Kabupaten Garut',
          subtitle: 'Layanan Informasi Publik yang Transparan dan Akuntabel',
          backgroundImage: '/hero-bg.jpg',
          ctaText: 'Ajukan Permohonan',
          ctaUrl: '/permohonan',
          slides: [
            {
              title: 'Layanan Informasi Publik',
              subtitle: 'Akses informasi publik dengan mudah dan transparan',
              image: '/hero-bg.jpg',
              ctaText: 'Lihat Informasi',
              ctaUrl: '/informasi'
            },
            {
              title: 'Permohonan Informasi',
              subtitle: 'Ajukan permohonan informasi sesuai UU No. 14 Tahun 2008',
              image: '/hero-bg.jpg',
              ctaText: 'Ajukan Sekarang',
              ctaUrl: '/permohonan'
            }
          ]
        })
      }
    });

    console.log('✅ Settings seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedSettings()
    .then(() => {
      console.log('Settings seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Settings seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSettings };