import { useState, useEffect, useCallback } from 'react';
import { getAdminData, postData } from '@/lib/api';

interface InformasiData {
  id: number;
  judul: string;
  klasifikasi: string;
  ringkasan_isi_informasi: string;
  pejabat_penguasa_informasi?: string;
  file_url?: string;
  created_at: string;
}

export const useInformasiData = () => {
  const [informasi, setInformasi] = useState<InformasiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return;
      }

      const response = await getAdminData('/informasi', token);
      setInformasi(response.data || []);
    } catch (error) {
      console.error('Error loading informasi:', error);
      setInformasi([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createInformasi = async (data: any) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');
    
    const response = await postData('/informasi', data, token);
    await loadData(); // Refresh data
    return response;
  };

  const updateInformasi = async (id: number, data: any) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informasi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update');
    await loadData(); // Refresh data
    return response.json();
  };

  const deleteInformasi = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informasi/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    await loadData(); // Refresh data
  };

  return {
    informasi,
    isLoading,
    loadData,
    createInformasi,
    updateInformasi,
    deleteInformasi
  };
};