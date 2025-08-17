import { useState, useEffect, useCallback } from 'react';
import { getAdminData, postData } from '@/lib/api';

interface InformasiData {
  id: number;
  judul: string;
  klasifikasi: string;
  ringkasan_isi_informasi: string;
  pejabat_penguasa_informasi?: string;
  file_url?: string;
  tanggal_posting?: string;
  thumbnail?: string;
  status?: 'draft' | 'published' | 'scheduled';
  jadwal_publish?: string;
  created_at: string;
  file_attachments?: string;
  links?: string;
}

interface InformasiFormData {
  judul: string;
  klasifikasi: string;
  ringkasan_isi_informasi: string;
  pejabat_penguasa_informasi?: string;
  tanggal_posting?: string;
  thumbnail?: string;
  status?: 'draft' | 'published' | 'scheduled';
  jadwal_publish?: string;
  files?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  links?: Array<{
    title: string;
    url: string;
  }>;
}

export const useInformasiData = (limit = 10, page = 1, setTotalPages?: (pages: number) => void, setTotalItems?: (items: number) => void, filters?: any) => {
  const [informasi, setInformasi] = useState<InformasiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return;
      }

      let url = `/informasi?limit=${limit}&page=${page}`;
      if (filters) {
        if (filters.kategori) url += `&klasifikasi=${filters.kategori}`;
        if (filters.tahun) url += `&tahun=${filters.tahun}`;
        if (filters.tanggalMulai) url += `&tanggalMulai=${filters.tanggalMulai}`;
        if (filters.tanggalSelesai) url += `&tanggalSelesai=${filters.tanggalSelesai}`;
        if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
        if (filters.statusFilter) url += `&status=${filters.statusFilter}`;
      }
      const response = await getAdminData(url, token);
      setInformasi(response.data || []);
      if (response.pagination) {
        setTotalPages?.(response.pagination.totalPages || 1);
        setTotalItems?.(response.pagination.total || 0);
      }
    } catch (error) {
      console.error('Error loading informasi:', error);
      setInformasi([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit, page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData, limit, page, filters]);

  const createInformasi = async (data: InformasiFormData) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');
    
    const response = await postData('/informasi', data, token);
    await loadData(); // Refresh data
    return response;
  };

  const updateInformasi = async (id: number, data: InformasiFormData) => {
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