import { useState, useEffect } from 'react';
import { getPublicData } from '@/lib/api';

interface PublicStats {
  totalPermintaan: number;
  permintaanSelesai: number;
  rataRataHari: number;
  totalInformasi: number;
}

export const usePublicStats = () => {
  const [stats, setStats] = useState<PublicStats>({
    totalPermintaan: 0,
    permintaanSelesai: 0,
    rataRataHari: 7,
    totalInformasi: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get informasi count
        const informasiData = await getPublicData('/informasi');
        const totalInformasi = informasiData.data?.length || 0;

        setStats({
          totalPermintaan: 0, // Will be 0 since we cleared data
          permintaanSelesai: 0,
          rataRataHari: 7,
          totalInformasi
        });
      } catch (error) {
        console.error('Error loading public stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, isLoading };
};