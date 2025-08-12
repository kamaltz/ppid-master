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
  };
  rincian_informasi: string;
  status: string;
  tanggal_permintaan: string;
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      // Get permintaan data
      const permintaanResponse = await getPermintaan(token, { limit: 50 });
      const permintaanData = permintaanResponse.data || [];
      
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

  // Generate chart data from real data
  const chartData = {
    status: [
      { name: 'Diajukan', value: stats.diajukan },
      { name: 'Diproses', value: stats.diproses },
      { name: 'Selesai', value: stats.selesai },
      { name: 'Ditolak', value: stats.ditolak }
    ],
    monthly: [], // Can be implemented later with date grouping
    daily: [],   // Can be implemented later with date grouping
    category: [] // Can be implemented later with categorization
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