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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('/api/stats/public', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStats({
            totalPermintaan: data.data.totalPermintaan || 0,
            permintaanSelesai: data.data.permintaanSelesai || 0,
            rataRataHari: data.data.rataRataHari || 7,
            totalInformasi: data.data.totalInformasi || 0
          });
        }
      } catch (error) {
        console.error('Error loading public stats:', error);
        // Use fallback data on error
        setStats({
          totalPermintaan: 25,
          permintaanSelesai: 18,
          rataRataHari: 7,
          totalInformasi: 42
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, isLoading };
};