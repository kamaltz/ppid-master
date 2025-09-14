export const seedData = {
  admin: {
    email: "admin@garutkab.go.id",
    password: "Garut@2025?",
    nama: "Administrator PPID"
  },
  settings: {
    general: {
      namaInstansi: "PPID Diskominfo Kabupaten Garut",
      logo: "/logo-garut.svg",
      email: "ppid@garutkab.go.id",
      telepon: "(0262) 123456",
      alamat: "Jl. Pembangunan No. 1, Garut, Jawa Barat"
    },
    header: {
      menuItems: [
        { label: "Beranda", url: "/", hasDropdown: false, dropdownItems: [] },
        { 
          label: "Profil", 
          url: "/profil", 
          hasDropdown: true, 
          dropdownItems: [
            { label: "Tentang PPID", url: "/profil" },
            { label: "Visi Misi", url: "/visi-misi" }
          ]
        },
        { label: "Informasi Publik", url: "/informasi", hasDropdown: false, dropdownItems: [] },
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
    }
  },
  categories: [
    { nama: "Informasi Berkala", deskripsi: "Informasi yang wajib disediakan dan diumumkan secara berkala" },
    { nama: "Informasi Serta Merta", deskripsi: "Informasi yang wajib diumumkan secara serta merta" },
    { nama: "Informasi Setiap Saat", deskripsi: "Informasi yang wajib tersedia setiap saat" }
  ]
};