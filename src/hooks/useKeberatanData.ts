import { useState, useEffect, useCallback } from 'react';
import { getAdminData } from '@/lib/api';

interface KeberatanData {
  id: number;
  pemohon?: {
    nama: string;
    email: string;
  };
  permintaan_id: number;
  alasan_keberatan: string;
  kasus_posisi?: string;
  status: string;
  tanggal_keberatan?: string;
  created_at: string;
  tanggapan_atasan?: string;
}

interface KeberatanStatusData {
  status: string;
  tanggapan_atasan?: string;
  catatan_ppid?: string;
}

export const useKeberatanData = () => {
  const [keberatan, setKeberatan] = useState<KeberatanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await getAdminData('/keberatan', token);
      setKeberatan(response.data || []);
    } catch (error) {
      console.error('Error loading keberatan:', error);
      setKeberatan([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadDataSafe = async () => {
      if (mounted) {
        await loadData();
      }
    };
    loadDataSafe();
    return () => { mounted = false; };
  }, [loadData]);

  const updateKeberatanStatus = async (id: number, statusData: KeberatanStatusData) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`/api/keberatan/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });
    
    if (!response.ok) throw new Error('Failed to update');
    await loadData();
    return response.json();
  };

  const deleteKeberatan = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`/api/keberatan/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    await loadData();
  };

  return {
    keberatan,
    isLoading,
    loadData,
    updateKeberatanStatus,
    deleteKeberatan
  };
};