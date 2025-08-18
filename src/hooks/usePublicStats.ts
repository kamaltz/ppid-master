"use client";

import { useState, useEffect } from 'react';


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
        console.log('Loading stats from hook...');
        const response = await fetch('/api/stats/public');
        const data = await response.json();
        
        console.log('API response:', data);
        
        if (data.success) {
          const newStats = {
            totalPermintaan: data.data.totalPermintaan || 0,
            permintaanSelesai: data.data.permintaanSelesai || 0,
            rataRataHari: data.data.rataRataHari || 7,
            totalInformasi: data.data.totalInformasi || 0
          };
          console.log('Setting stats:', newStats);
          setStats(newStats);
        }
      } catch (error) {
        console.error('Error loading public stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading };
};