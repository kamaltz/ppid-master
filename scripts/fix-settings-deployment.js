// Deployment script to fix settings structure
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSettingsForDeployment() {
  try {
    console.log('🔧 Fixing settings structure for deployment...');
    
    // General settings
    const generalSettings = {
      namaInstansi: "PPID Diskominfo Kabupaten Garut",
      logo: "/logo-garut.svg",
      email: "ppid@garutkab.go.id",
      telepon: "(0262) 123456",
      alamat: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
      websiteTitle: "PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik",
      websiteDescription: "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008."
    };
    
    // Header settings
    const headerSettings = {
      menuItems: [
        { label: "Beranda", url: "/", hasDropdown: false, dropdownItems: [] },
        {
          label: "Profil",
          url: "/profil",
          hasDropdown: true,
          dropdownItems: [
            { label: "Tentang PPID", url: "/profil" },
            { label: "Visi Misi", url: "/visi-misi" },
            { label: "Struktur Organisasi", url: "/struktur" }
          ]
        },
        {
          label: "Informasi Publik",
          url: "/informasi",
          hasDropdown: false,
          dropdownItems: []
        },
        {
          label: "Layanan",
          url: "/layanan",
          hasDropdown: true,
          dropdownItems: [
            { label: "Permohonan Informasi", url: "/permohonan" },
            { label: "Keberatan", url: "/keberatan" }
          ]
        }
      ]
    };
    
    // Footer settings
    const footerSettings = {
      companyName: "PPID Kabupaten Garut",
      description: "PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.",
      address: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
      phone: "(0262) 123456",
      email: "ppid@garutkab.go.id",
      socialMedia: { facebook: "", twitter: "", instagram: "", youtube: "" },
      quickLinks: [
        { label: "Beranda", url: "/" },
        { label: "Profil PPID", url: "/profil" },
        { label: "DIP", url: "/dip" },
        { label: "Kontak", url: "/kontak" }
      ],
      copyrightText: "PPID Kabupaten Garut. Semua hak dilindungi.",
      showAddress: true,
      showContact: true,
      showSocialMedia: true
    };
    
    // Hero settings
    const heroSettings = {
      title: "Selamat Datang di PPID Kabupaten Garut",
      subtitle: "Pejabat Pengelola Informasi dan Dokumentasi",
      description: "Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.",
      backgroundImage: "",
      ctaText: "Ajukan Permohonan",
      ctaUrl: "/permohonan",
      isCarousel: false,
      autoSlide: true,
      slideInterval: 4000,
      slides: []
    };
    
    // Update settings
    await prisma.setting.upsert({
      where: { key: 'general' },
      update: { value: JSON.stringify(generalSettings) },
      create: { key: 'general', value: JSON.stringify(generalSettings) }
    });
    
    await prisma.setting.upsert({
      where: { key: 'header' },
      update: { value: JSON.stringify(headerSettings) },
      create: { key: 'header', value: JSON.stringify(headerSettings) }
    });
    
    await prisma.setting.upsert({
      where: { key: 'footer' },
      update: { value: JSON.stringify(footerSettings) },
      create: { key: 'footer', value: JSON.stringify(footerSettings) }
    });
    
    await prisma.setting.upsert({
      where: { key: 'hero' },
      update: { value: JSON.stringify(heroSettings) },
      create: { key: 'hero', value: JSON.stringify(heroSettings) }
    });
    
    console.log('✅ Settings structure fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fixSettingsForDeployment()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { fixSettingsForDeployment };