// Dummy data generator untuk simulasi realtime
export interface RequestData {
  id: string;
  nama: string;
  email: string;
  jenis_informasi: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  tanggal: string;
  kategori: 'Berkala' | 'Setiap Saat' | 'Serta Merta' | 'Dikecualikan';
}

const names = ['Ahmad Rizki', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Sartika', 'Eko Prasetyo', 'Fitri Handayani', 'Gunawan', 'Hesti Purwanti'];
const emails = ['ahmad@email.com', 'siti@email.com', 'budi@email.com', 'dewi@email.com', 'eko@email.com', 'fitri@email.com', 'gunawan@email.com', 'hesti@email.com'];
const jenisInfo = ['Laporan Keuangan', 'Struktur Organisasi', 'Profil Pejabat', 'Data Statistik', 'Rencana Kerja', 'Laporan Kinerja'];
const statuses: RequestData['status'][] = ['pending', 'approved', 'rejected', 'processing'];
const kategoris: RequestData['kategori'][] = ['Berkala', 'Setiap Saat', 'Serta Merta', 'Dikecualikan'];

// Generate dummy requests
export const generateDummyRequests = (count: number = 50): RequestData[] => {
  const requests: RequestData[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
    requests.push({
      id: `REQ${String(i + 1).padStart(3, '0')}`,
      nama: names[Math.floor(Math.random() * names.length)],
      email: emails[Math.floor(Math.random() * emails.length)],
      jenis_informasi: jenisInfo[Math.floor(Math.random() * jenisInfo.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      tanggal: date.toISOString().split('T')[0],
      kategori: kategoris[Math.floor(Math.random() * kategoris.length)]
    });
  }
  
  return requests.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
};

// Generate monthly data from actual requests
export const generateMonthlyData = (requests: RequestData[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
  const currentDate = new Date();
  
  return months.map((month, index) => {
    // Count actual requests for each month
    const monthRequests = requests.filter(req => {
      const reqDate = new Date(req.tanggal);
      return reqDate.getMonth() === index;
    });
    
    return {
      label: month,
      value: monthRequests.length,
      color: '#3B82F6'
    };
  });
};

// Generate daily data from actual requests (last 7 days)
export const generateDailyData = (requests: RequestData[]) => {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const today = new Date();
  
  return days.map((day, index) => {
    // Get date for last 7 days
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (6 - index));
    
    // Count requests for this specific day
    const dayRequests = requests.filter(req => {
      const reqDate = new Date(req.tanggal);
      return reqDate.toDateString() === targetDate.toDateString();
    });
    
    return {
      label: day,
      value: dayRequests.length,
      color: '#8B5CF6'
    };
  });
};

// Generate category data from localStorage informasi
export const generateCategoryData = () => {
  const savedInformasi = typeof window !== 'undefined' ? localStorage.getItem('informasi_data') : null;
  const informasiData = savedInformasi ? JSON.parse(savedInformasi) : [];
  
  const categoryCounts = informasiData.reduce((acc: Record<string, number>, item: any) => {
    acc[item.kategori] = (acc[item.kategori] || 0) + 1;
    return acc;
  }, {});
  
  return kategoris.map(kategori => ({
    label: kategori,
    value: categoryCounts[kategori] || 0,
    color: '#06B6D4'
  }));
};

// Generate status data
export const generateStatusData = (requests: RequestData[]) => {
  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    { label: 'Disetujui', value: statusCounts.approved || 0, color: '#10B981' },
    { label: 'Diproses', value: statusCounts.processing || 0, color: '#3B82F6' },
    { label: 'Menunggu', value: statusCounts.pending || 0, color: '#F59E0B' },
    { label: 'Ditolak', value: statusCounts.rejected || 0, color: '#EF4444' }
  ];
};

// Simulate realtime updates
export const simulateRealtimeUpdate = (currentRequests: RequestData[]): RequestData[] => {
  const updated = [...currentRequests];
  
  // Random chance to add new request
  if (Math.random() < 0.3) {
    const newRequest: RequestData = {
      id: `REQ${String(updated.length + 1).padStart(3, '0')}`,
      nama: names[Math.floor(Math.random() * names.length)],
      email: emails[Math.floor(Math.random() * emails.length)],
      jenis_informasi: jenisInfo[Math.floor(Math.random() * jenisInfo.length)],
      status: 'pending',
      tanggal: new Date().toISOString().split('T')[0],
      kategori: kategoris[Math.floor(Math.random() * kategoris.length)]
    };
    updated.unshift(newRequest);
  }
  
  // Random chance to update existing request status
  if (updated.length > 0 && Math.random() < 0.4) {
    const randomIndex = Math.floor(Math.random() * Math.min(updated.length, 10));
    const currentStatus = updated[randomIndex].status;
    
    if (currentStatus === 'pending') {
      updated[randomIndex].status = Math.random() < 0.7 ? 'processing' : 'approved';
    } else if (currentStatus === 'processing') {
      updated[randomIndex].status = Math.random() < 0.8 ? 'approved' : 'rejected';
    }
  }
  
  return updated.slice(0, 50); // Keep only latest 50
};