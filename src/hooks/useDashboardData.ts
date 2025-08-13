import { useState, useEffect, useCallback } from 'react';
import { getAdminData, getPermintaan } from '@/lib/api';

interface DashboardStats {
  total: number;
  diajukan: number;
  diproses: number;
  selesai: number;
  ditolak: number;
}

interface PermintaanData {
  id: number;
  pemohon: {
    nama: string;
    email: string;
    nik?: string;
    no_telepon?: string;
  };
  rincian_informasi: string;
  status: string;
  created_at: string | Date;
  file_attachments?: string | string[];
}

export const useDashboardData = () => {
  const [permintaan, setPermintaan] = useState<PermintaanData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    diajukan: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try database first, fallback to localStorage
      let permintaanData = [];
      
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('Fetching from API with token:', !!token);
          const permintaanResponse = await getPermintaan(token, { limit: 50 });
          permintaanData = permintaanResponse.data || [];
          console.log('API Response:', permintaanResponse);
          console.log('First item from API:', permintaanData[0]);
        }
      } catch (dbError) {
        console.log('Database failed, using localStorage:', dbError);
      }
      
      // If no database data, use localStorage
      if (permintaanData.length === 0) {
        const localData = JSON.parse(localStorage.getItem('permintaan') || '[]');
        // Normalize data format and ensure proper dates
        permintaanData = localData.map((item: any) => {
          // Handle different date field names and formats
          let dateValue = item.created_at || item.tanggal;
          
          // Validate and fix date
          if (!dateValue) {
            dateValue = new Date().toISOString();
          } else {
            const testDate = new Date(dateValue);
            if (isNaN(testDate.getTime())) {
              // If invalid, try to fix common formats
              if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dateValue = `${dateValue}T00:00:00.000Z`;
              } else {
                dateValue = new Date().toISOString();
              }
            } else {
              dateValue = testDate.toISOString();
            }
          }
          
          // Normalize status values
          let normalizedStatus = item.status;
          if (item.status === 'pending') normalizedStatus = 'Diajukan';
          if (item.status === 'processing') normalizedStatus = 'Diproses';
          if (item.status === 'approved') normalizedStatus = 'Selesai';
          if (item.status === 'rejected') normalizedStatus = 'Ditolak';
          
          return {
            ...item,
            created_at: dateValue,
            status: normalizedStatus,
            pemohon: item.pemohon || {
              nama: item.nama || 'Unknown',
              email: item.email || 'Unknown',
              nik: item.nik || null,
              no_telepon: item.no_telepon || null
            },
            rincian_informasi: item.rincian_informasi || item.jenis_informasi || 'Tidak ada detail'
          };
        });
        console.log('Using localStorage data:', permintaanData.length, 'items');
      }
      
      setPermintaan(permintaanData);

      // Calculate stats
      const newStats = {
        total: permintaanData.length,
        diajukan: permintaanData.filter((p: any) => p.status === 'Diajukan').length,
        diproses: permintaanData.filter((p: any) => p.status === 'Diproses').length,
        selesai: permintaanData.filter((p: any) => p.status === 'Selesai').length,
        ditolak: permintaanData.filter((p: any) => p.status === 'Ditolak').length
      };
      
      setStats(newStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Generate real-time chart data from database
  const generateMonthlyData = (data: any[]) => {
    const monthlyStats: { [key: string]: number } = {};
    data.forEach((item: any) => {
      if (!item.created_at) return;
      const itemDate = new Date(item.created_at);
      if (isNaN(itemDate.getTime())) {
        console.warn('Invalid date found:', item.created_at);
        return;
      }
      const month = itemDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });
    return Object.entries(monthlyStats).map(([month, count]) => ({ month, count: count || 0 }));
  };

  const generateDailyData = (data: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return last7Days.map(date => {
      const count = data.filter((item: any) => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at);
        if (isNaN(itemDate.getTime())) {
          console.warn('Invalid date found in daily data:', item.created_at);
          return false;
        }
        return itemDate.toISOString().split('T')[0] === date;
      }).length;
      return { 
        date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }), 
        count: count || 0 
      };
    });
  };

  const generateCategoryData = (data: any[]) => {
    const categories: { [key: string]: number } = {};
    data.forEach((item: any) => {
      if (!item.rincian_informasi) return;
      const category = item.rincian_informasi.length > 50 ? 'Informasi Kompleks' : 'Informasi Sederhana';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value: value || 0 }));
  };

  const chartData = {
    status: [
      { name: 'Diajukan', value: stats.diajukan, color: '#3B82F6' },
      { name: 'Diproses', value: stats.diproses, color: '#F59E0B' },
      { name: 'Selesai', value: stats.selesai, color: '#10B981' },
      { name: 'Ditolak', value: stats.ditolak, color: '#EF4444' }
    ],
    monthly: generateMonthlyData(permintaan),
    daily: generateDailyData(permintaan),
    category: generateCategoryData(permintaan)
  };

  return {
    permintaan,
    stats,
    chartData,
    isLoading,
    lastUpdate,
    refreshData
  };
};