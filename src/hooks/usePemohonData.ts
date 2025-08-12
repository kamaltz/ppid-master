import { useState, useEffect, useCallback } from 'react';
import { getPermintaan } from '@/lib/api';

interface PermintaanData {
  id: number;
  rincian_informasi: string;
  status: string;
  tanggal_permintaan: string;
  catatan_ppid?: string;
}

export const usePemohonData = () => {
  const [permintaan, setPermintaan] = useState<PermintaanData[]>([]);
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

      // Get permintaan data for current user
      const permintaanResponse = await getPermintaan(token, { limit: 50 });
      const permintaanData = permintaanResponse.data || [];
      
      setPermintaan(permintaanData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading pemohon data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  const stats = {
    total: permintaan.length,
    diajukan: permintaan.filter(p => p.status === 'Diajukan').length,
    diproses: permintaan.filter(p => p.status === 'Diproses').length,
    selesai: permintaan.filter(p => p.status === 'Selesai').length,
    ditolak: permintaan.filter(p => p.status === 'Ditolak').length
  };

  return {
    permintaan,
    stats,
    isLoading,
    lastUpdate,
    refreshData
  };
};