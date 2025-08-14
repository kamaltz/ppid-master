import { prisma } from '@/lib/prisma';

const defaultSettings = {
  general: {
    namaInstansi: 'PPID Diskominfo Kabupaten Garut',
    logo: '/logo-garut.svg',
    email: 'ppid@garutkab.go.id',
    telepon: '(0262) 123456',
    alamat: 'Jl. Pembangunan No. 1, Garut, Jawa Barat',
    websiteTitle: 'PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik',
    websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.'
  },
  header: {
    menuItems: [
      { label: 'Beranda', url: '/', hasDropdown: false, dropdownItems: [] },
      { label: 'Profil', url: '/profil', hasDropdown: true, dropdownItems: [
        { label: 'Tentang PPID', url: '/profil' },
        { label: 'Visi Misi', url: '/visi-misi' },
        { label: 'Struktur Organisasi', url: '/struktur' }
      ]},
      { label: 'Informasi Publik', url: '/informasi', hasDropdown: false, dropdownItems: [] },
      { label: 'Layanan', url: '/layanan', hasDropdown: true, dropdownItems: [
        { label: 'Permohonan Informasi', url: '/permohonan' },
        { label: 'Keberatan', url: '/keberatan' }
      ]}
    ]
  },
  footer: {
    companyName: 'PPID Kabupaten Garut',
    description: 'PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.',
    address: 'Jl. Pembangunan No. 1, Garut, Jawa Barat',
    phone: '(0262) 123456',
    email: 'ppid@garutkab.go.id',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    quickLinks: [
      { label: 'Beranda', url: '/' },
      { label: 'Profil PPID', url: '/profil' },
      { label: 'DIP', url: '/dip' },
      { label: 'Kontak', url: '/kontak' }
    ],
    copyrightText: 'PPID Kabupaten Garut. Semua hak dilindungi.',
    showAddress: true,
    showContact: true,
    showSocialMedia: true
  },
  style: {
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#10b981',
    backgroundColor: '#f8fafc',
    textColor: '#1f2937'
  },
  hero: {
    title: 'Selamat Datang di PPID Kabupaten Garut',
    subtitle: 'Pejabat Pengelola Informasi dan Dokumentasi',
    description: 'Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.',
    backgroundImage: '',
    ctaText: 'Ajukan Permohonan',
    ctaUrl: '/permohonan'
  }
};

export async function seedSettings() {
  try {
    console.log('🌱 Seeding default settings...');
    
    // Delete all existing settings first for reset
    await prisma.setting.deleteMany({});
    
    for (const [key, value] of Object.entries(defaultSettings)) {
      await prisma.setting.create({
        key,
        value: JSON.stringify(value)
      });
      console.log(`✅ Seeded setting: ${key}`);
    }
    
    console.log('🎉 Settings seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  }
}

// Run if called directly
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