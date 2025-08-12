// Seed data untuk upload ke database
import { generateDummyRequests } from './dummyData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Seed requests data
export const seedRequests = async () => {
  try {
    const dummyRequests = generateDummyRequests(30);
    
    for (const request of dummyRequests) {
      await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
    }
    
    console.log('Requests seeded successfully');
  } catch (error) {
    console.error('Failed to seed requests:', error);
  }
};

// Seed informasi data
export const seedInformasi = async () => {
  try {
    const informasiData = [
      {
        judul: "Laporan Keuangan 2023",
        kategori: "Berkala",
        status: "Aktif",
        konten: "<p>Laporan keuangan tahun 2023 telah tersedia untuk diunduh.</p>",
        files: []
      },
      {
        judul: "Struktur Organisasi",
        kategori: "Setiap Saat",
        status: "Aktif",
        konten: "<p>Struktur organisasi Diskominfo Kabupaten Garut.</p>",
        files: []
      },
      {
        judul: "Pengumuman Darurat",
        kategori: "Serta Merta",
        status: "Aktif",
        konten: "<p>Pengumuman terkait situasi darurat.</p>",
        files: []
      }
    ];
    
    for (const informasi of informasiData) {
      await fetch(`${API_BASE_URL}/informasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(informasi)
      });
    }
    
    console.log('Informasi seeded successfully');
  } catch (error) {
    console.error('Failed to seed informasi:', error);
  }
};

// Seed pages data
export const seedPages = async () => {
  try {
    const pagesData = [
      {
        slug: "profil-ppid",
        title: "Profil PPID",
        content: "<h2>Profil PPID Diskominfo Garut</h2><p>Pejabat Pengelola Informasi dan Dokumentasi...</p>",
        files: [],
        sections: []
      },
      {
        slug: "dip",
        title: "Daftar Informasi Publik (DIP)",
        content: "<h2>Daftar Informasi Publik</h2><p>Katalog informasi yang wajib disediakan...</p>",
        files: [],
        sections: []
      }
    ];
    
    for (const page of pagesData) {
      await fetch(`${API_BASE_URL}/pages/${page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page)
      });
    }
    
    console.log('Pages seeded successfully');
  } catch (error) {
    console.error('Failed to seed pages:', error);
  }
};

// Seed all data
export const seedAllData = async () => {
  console.log('Starting data seeding...');
  await seedRequests();
  await seedInformasi();
  await seedPages();
  console.log('All data seeded successfully');
};