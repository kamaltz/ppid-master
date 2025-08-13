// Generate test data with proper format for dashboard
export const generateTestPermintaan = (count: number = 20) => {
  const names = ['Ahmad Rizki', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Sartika', 'Eko Prasetyo', 'Fitri Handayani'];
  const emails = ['ahmad@email.com', 'siti@email.com', 'budi@email.com', 'dewi@email.com', 'eko@email.com', 'fitri@email.com'];
  const informasiTypes = [
    'Laporan Keuangan Tahunan',
    'Struktur Organisasi Dinas',
    'Profil Pejabat Struktural',
    'Data Statistik Daerah',
    'Rencana Kerja Tahunan',
    'Laporan Kinerja Instansi'
  ];
  const statuses = ['Diajukan', 'Diproses', 'Selesai', 'Ditolak'];

  const testData = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Generate random date within last 30 days
    const randomDays = Math.floor(Math.random() * 30);
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    
    const createdDate = new Date(now);
    createdDate.setDate(now.getDate() - randomDays);
    createdDate.setHours(randomHours, randomMinutes, 0, 0);

    const nameIndex = Math.floor(Math.random() * names.length);
    
    testData.push({
      id: i + 1,
      pemohon_id: i + 1,
      pemohon: {
        id: i + 1,
        nama: names[nameIndex],
        email: emails[nameIndex],
        nik: `327${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        no_telepon: `08${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`
      },
      rincian_informasi: informasiTypes[Math.floor(Math.random() * informasiTypes.length)],
      tujuan_penggunaan: 'Untuk keperluan penelitian dan analisis',
      cara_memperoleh_informasi: 'Email',
      cara_mendapat_salinan: 'Email',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      catatan_ppid: Math.random() > 0.7 ? 'Dokumen sedang dalam proses verifikasi' : null,
      file_attachments: Math.random() > 0.6 ? ['dokumen1.pdf', 'lampiran.docx'] : null,
      created_at: createdDate.toISOString(),
      updated_at: createdDate.toISOString()
    });
  }

  return testData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Function to populate localStorage with test data
export const populateTestData = () => {
  if (typeof window !== 'undefined') {
    // Clear existing data first
    localStorage.removeItem('permintaan');
    const testData = generateTestPermintaan(25);
    localStorage.setItem('permintaan', JSON.stringify(testData));
    console.log('Test data populated:', testData.length, 'items');
    return testData;
  }
  return [];
};

// Function to clear test data
export const clearTestData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('permintaan');
    console.log('Test data cleared');
  }
};