"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ROLES, getRoleDisplayName } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useInformasiData } from "@/hooks/useInformasiData";
import { useAuth } from "@/context/AuthContext";
import { X, Upload, Link as LinkIcon, FileText, Filter } from "lucide-react";
import Image from "next/image";

interface Category {
  id: number;
  slug: string;
  nama: string;
}

interface InformasiItem {
  id: number;
  judul: string;
  klasifikasi: string;
  ringkasan_isi_informasi: string;
  tanggal_posting?: string;
  thumbnail?: string;
  status?: 'draft' | 'published' | 'scheduled';
  jadwal_publish?: string;
  pejabat_penguasa_informasi?: string;
  created_at: string;
  links?: string | { title: string; url: string }[];
  file_attachments?: string | { name: string; url: string; size?: number }[];
  images?: string | string[];
}

export default function AdminInformasiPage() {
  const { getUserRole, getUserName } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    judul: '', 
    klasifikasi: '', 
    ringkasan_isi_informasi: '',
    tanggal_posting: new Date().toISOString().split('T')[0],
    thumbnail: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    jadwal_publish: '',
    files: [] as File[],
    existingFiles: [] as { name: string; url: string; size?: number }[],
    links: [{ title: '', url: '' }] as { title: string; url: string }[],
    images: [] as string[]
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    kategori: '',
    tahun: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    statusFilter: 'published'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [allInformasi, setAllInformasi] = useState<InformasiItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const { informasi, isLoading, createInformasi, updateInformasi, deleteInformasi, loadData } = useInformasiData(itemsPerPage, currentPage, setTotalPages, setTotalItems, filters);
  
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/kategori');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0 && !formData.klasifikasi) {
          setFormData(prev => ({ ...prev, klasifikasi: data.data[0].slug }));
        }
      }
    } catch {
      console.error('Failed to fetch categories');
    }
  }, [formData.klasifikasi]);

  const fetchAllInformasi = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch('/api/informasi?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success || data.data) {
        setAllInformasi(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch all informasi:', error);
    }
  }, []);

  const fetchAvailableImages = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/uploads/images', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const imageUrls = data.images?.map((img: string | { url: string }) => typeof img === 'string' ? img : img.url) || [];
        setAvailableImages(imageUrls);
      }
    } catch (error) {
      console.error('Failed to fetch available images:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchAllInformasi();
    fetchAvailableImages();
  }, [fetchCategories, fetchAllInformasi, fetchAvailableImages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (loadData) loadData();
  }, [itemsPerPage, loadData]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    console.log('Form submitted with data:', formData);
    
    // Validate required fields
    if (!formData.judul.trim()) {
      alert('❌ Judul harus diisi');
      return;
    }
    if (!formData.klasifikasi) {
      alert('❌ Kategori harus dipilih');
      return;
    }
    if (!formData.ringkasan_isi_informasi.trim()) {
      alert('❌ Isi informasi harus diisi');
      return;
    }
    if (formData.status === 'scheduled' && !formData.jadwal_publish) {
      alert('❌ Jadwal publish harus diisi untuk status terjadwal');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Upload files first
      const uploadedFiles = [];
      for (const file of formData.files) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        
        const token = localStorage.getItem('auth_token');
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData
        });
        
        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);
        if (uploadResult.success) {
          uploadedFiles.push({
            name: uploadResult.originalName,
            url: uploadResult.url,
            size: uploadResult.size || 0
          });
        } else {
          console.error('Upload failed:', uploadResult.error);
          alert(`Upload gagal untuk file ${file.name}: ${uploadResult.error}`);
        }
      }
      
      // Combine existing files with newly uploaded files, ensuring size is always a number
      const allFiles = [
        ...formData.existingFiles.map(file => ({
          name: file.name,
          url: file.url,
          size: file.size || 0
        })),
        ...uploadedFiles
      ];
      
      console.log('All files to be saved:', allFiles);
      
      const submitData = {
        judul: formData.judul,
        klasifikasi: formData.klasifikasi,
        ringkasan_isi_informasi: formData.ringkasan_isi_informasi,
        tanggal_posting: formData.tanggal_posting,
        thumbnail: formData.thumbnail,
        status: formData.status,
        jadwal_publish: formData.jadwal_publish,
        pejabat_penguasa_informasi: getUserRole() === 'PPID_PELAKSANA' ? getUserName() || 'PPID Pelaksana' : getRoleDisplayName(getUserRole()) || 'PPID Diskominfo',
        files: allFiles,
        links: formData.links.filter(link => link.title.trim() !== '' && link.url.trim() !== ''),
        images: formData.images
      };
      
      if (editId) {
        await updateInformasi(editId, submitData);
      } else {
        await createInformasi(submitData);
      }
      
      await fetchAllInformasi();
      
      // Success feedback
      const statusText = formData.status === 'draft' ? 'draft' : formData.status === 'scheduled' ? 'terjadwal' : 'published';
      alert(`✅ Informasi berhasil ${editId ? 'diperbarui' : 'disimpan'} sebagai ${statusText}`);
      
      setShowForm(false);
      setEditId(null);
      setFormData({ 
        judul: '', 
        klasifikasi: categories.length > 0 ? categories[0].slug : '', 
        ringkasan_isi_informasi: '',
        tanggal_posting: new Date().toISOString().split('T')[0],
        thumbnail: '',
        status: 'draft' as 'draft' | 'published' | 'scheduled',
        jadwal_publish: '',
        files: [],
        existingFiles: [],
        links: [{ title: '', url: '' }],
        images: []
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`❌ Gagal menyimpan informasi: ${error instanceof Error ? error.message : 'Silakan coba lagi'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: InformasiItem) => {
    // Parse links if it's a JSON string
    let parsedLinks = [{ title: '', url: '' }];
    if (item.links) {
      try {
        parsedLinks = typeof item.links === 'string' ? JSON.parse(item.links) : item.links;
        if (!Array.isArray(parsedLinks) || parsedLinks.length === 0) {
          parsedLinks = [{ title: '', url: '' }];
        }
      } catch {
        parsedLinks = [{ title: '', url: '' }];
      }
    }
    
    // Parse existing files
    let existingFiles = [];
    if (item.file_attachments) {
      try {
        existingFiles = typeof item.file_attachments === 'string' ? JSON.parse(item.file_attachments) : item.file_attachments;
        if (!Array.isArray(existingFiles)) {
          existingFiles = [];
        }
      } catch {
        existingFiles = [];
      }
    }
    
    // Parse images
    let images: string[] = [];
    if ('images' in item && item.images) {
      try {
        images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
        if (!Array.isArray(images)) images = [];
      } catch {
        images = [];
      }
    }
    
    setFormData({ 
      judul: item.judul, 
      klasifikasi: item.klasifikasi, 
      ringkasan_isi_informasi: item.ringkasan_isi_informasi,
      tanggal_posting: item.tanggal_posting ? new Date(item.tanggal_posting).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      thumbnail: ('thumbnail' in item ? item.thumbnail : '') || '',
      status: ('status' in item ? item.status : 'published') || 'published',
      jadwal_publish: ('jadwal_publish' in item && item.jadwal_publish) ? new Date(item.jadwal_publish).toISOString().slice(0, 16) : '',
      files: [],
      existingFiles: existingFiles,
      links: parsedLinks,
      images: images
    });
    setEditId(item.id);
    setShowForm(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };
  
  const removeFile = (index: number) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };
  
  const removeExistingFile = (index: number) => {
    setFormData(prev => ({ ...prev, existingFiles: prev.existingFiles.filter((_, i) => i !== index) }));
  };
  
  const addLink = () => {
    setFormData(prev => ({ ...prev, links: [...prev.links, { title: '', url: '' }] }));
  };
  
  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      links: prev.links.map((link, i) => i === index ? { ...link, [field]: value } : link)
    }));
  };
  
  const removeLink = (index: number) => {
    setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  };

  const handleDelete = async (id: number) => {
    const item = informasi.find(i => i.id === id);
    if (confirm(`Yakin ingin menghapus informasi "${item?.judul}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await deleteInformasi(id);
        alert('Informasi berhasil dihapus');
        await fetchAllInformasi(); // Refresh all data for filters
      } catch {
        alert('Gagal menghapus informasi');
      }
    }
  };

  const resetFilters = () => {
    setFilters({
      kategori: '',
      tahun: '',
      tanggalMulai: '',
      tanggalSelesai: '',
      statusFilter: 'published'
    });
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(informasi.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  const handleBulkDraft = async () => {
    if (!confirm(`Yakin ingin mengubah ${selectedItems.length} informasi menjadi draft?`)) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      for (const id of selectedItems) {
        await fetch(`/api/informasi/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'draft' })
        });
      }
      alert(`✅ ${selectedItems.length} informasi berhasil diubah menjadi draft`);
      setSelectedItems([]);
      await fetchAllInformasi();
      if (loadData) loadData();
    } catch (error) {
      alert('❌ Gagal mengubah status informasi');
    }
  };

  const handleBulkPublish = async () => {
    if (!confirm(`Yakin ingin mempublish ${selectedItems.length} informasi?`)) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      for (const id of selectedItems) {
        await fetch(`/api/informasi/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'published' })
        });
      }
      alert(`✅ ${selectedItems.length} informasi berhasil dipublish`);
      setSelectedItems([]);
      await fetchAllInformasi();
      if (loadData) loadData();
    } catch (error) {
      alert('❌ Gagal mempublish informasi');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Yakin ingin menghapus ${selectedItems.length} informasi? Tindakan ini tidak dapat dibatalkan.`)) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      for (const id of selectedItems) {
        await fetch(`/api/informasi/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      alert(`✅ ${selectedItems.length} informasi berhasil dihapus`);
      setSelectedItems([]);
      await fetchAllInformasi();
      if (loadData) loadData();
    } catch (error) {
      alert('❌ Gagal menghapus informasi');
    }
  };

  const availableYears = useMemo(() => {
    if (!allInformasi || allInformasi.length === 0) return [];
    const years = allInformasi.map(item => {
      const date = new Date(item.tanggal_posting || item.created_at);
      return date.getFullYear();
    }).filter(year => !isNaN(year));
    return [...new Set(years)].sort((a, b) => b - a);
  }, [allInformasi]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Informasi</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filters.statusFilter}
              onChange={(e) => {
                setFilters({...filters, statusFilter: e.target.value});
                setCurrentPage(1);
              }}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="published">✅ Published</option>
              <option value="draft">📝 Draft</option>
              <option value="scheduled">⏰ Terjadwal</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Per halaman:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
            <button 
              onClick={async () => {
                if (confirm('Update semua data pejabat penguasa informasi dengan nama penulis yang sebenarnya?\n\nProses ini akan:\n- Mencari informasi dengan penulis "PPID Pelaksana"\n- Mengganti dengan nama asli penulis jika ditemukan\n- Atau menggunakan nama yang lebih spesifik')) {
                  try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/admin/update-informasi-authors', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success) {
                      alert(`✅ Berhasil!\n\nDitemukan: ${data.totalFound} informasi\nDiupdate: ${data.updated} informasi\n\nSilakan refresh halaman untuk melihat perubahan.`);
                      window.location.reload();
                    } else {
                      alert(`❌ ${data.error}`);
                    }
                  } catch (error) {
                    alert('❌ Gagal mengupdate data');
                  }
                }
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
            >
              🔄 Update Authors
            </button>
          </RoleGuard>
          <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Tambah Informasi
            </button>
          </RoleGuard>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter Informasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.statusFilter}
                onChange={(e) => setFilters({...filters, statusFilter: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Semua Status</option>
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
                <option value="scheduled">⏰ Terjadwal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                value={filters.kategori}
                onChange={(e) => setFilters({...filters, kategori: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.nama}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tahun</label>
              <select
                value={filters.tahun}
                onChange={(e) => setFilters({...filters, tahun: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={filters.tanggalMulai}
                onChange={(e) => setFilters({...filters, tanggalMulai: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
              <input
                type="date"
                value={filters.tanggalSelesai}
                onChange={(e) => setFilters({...filters, tanggalSelesai: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset Filter
              </button>
              <div className="text-sm text-gray-600 flex items-center">
                Menampilkan {informasi.length} dari {totalItems} informasi (Halaman {currentPage} dari {totalPages})
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Per halaman:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Tambah'} Informasi</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul</label>
                <input
                  type="text"
                  value={formData.judul || ''}
                  onChange={(e) => setFormData({...formData, judul: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Posting</label>
                <input
                  type="date"
                  value={formData.tanggal_posting || ''}
                  onChange={(e) => setFormData({...formData, tanggal_posting: e.target.value})}
                  min="2020-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                value={formData.klasifikasi || ''}
                onChange={(e) => setFormData({...formData, klasifikasi: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.nama}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Gambar Thumbnail (Opsional)</label>
              <div className="space-y-3">
                <input 
                  type="url" 
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                  <p className="font-semibold mb-1">📷 Rekomendasi Thumbnail:</p>
                  <ul className="space-y-1">
                    <li>• Masukkan URL gambar dari internet</li>
                    <li>• Format: JPG, PNG, WebP</li>
                    <li>• Ukuran: 800x600 pixels (4:3 rasio)</li>
                    <li>• Gambar berkualitas tinggi dan relevan dengan informasi</li>
                  </ul>
                </div>
                {formData.thumbnail && formData.thumbnail.startsWith('http') && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview Thumbnail:</p>
                    <Image src={formData.thumbnail} alt="Thumbnail Preview" width={128} height={96} className="object-cover border rounded-lg" onError={() => {
                      // Handle error silently
                    }} />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Galeri Gambar (Opsional)</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      for (const file of files) {
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);
                        try {
                          const token = localStorage.getItem('auth_token');
                          const response = await fetch('/api/upload/image', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: uploadFormData
                          });
                          const result = await response.json();
                          if (result.success) {
                            setFormData(prev => ({ ...prev, images: [...prev.images, result.url] }));
                          }
                        } catch (error) {
                          console.error('Upload failed:', error);
                        }
                      }
                      if (imageInputRef.current) imageInputRef.current.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Upload Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImageGallery(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Pilih dari Storage
                  </button>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.filter(img => img && (img.startsWith('http') || img.startsWith('/'))).map((img, index) => (
                      <div key={index} className="relative">
                        <Image src={img} alt={`Gallery ${index + 1}`} width={80} height={80} className="w-full h-20 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {showImageGallery && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-4xl max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">Pilih Gambar dari Storage</h3>
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {availableImages.filter(img => img && (img.startsWith('http') || img.startsWith('/'))).map((img, index) => (
                      <div key={index} className="cursor-pointer" onClick={() => {
                        if (!formData.images.includes(img)) {
                          setFormData(prev => ({ ...prev, images: [...prev.images, img] }));
                        }
                      }}>
                        <Image src={img} alt={`Storage ${index + 1}`} width={64} height={64} className="w-full h-16 object-cover rounded border hover:border-blue-500" />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImageGallery(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Isi Informasi</label>
              <textarea
                value={formData.ringkasan_isi_informasi || ''}
                onChange={(e) => setFormData({...formData, ringkasan_isi_informasi: e.target.value})}
                className="w-full border rounded px-3 py-2 min-h-[200px] resize-y"
                placeholder="Masukkan isi informasi lengkap..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Gunakan format teks biasa. Paragraf baru akan dipisahkan otomatis.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">File Lampiran</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4" />
                  Pilih File
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Format: PDF, Word, Excel, JPG, PNG (Max 10MB per file)
                </p>
                
                {/* Existing Files */}
                {formData.existingFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">File yang sudah ada:</p>
                    <div className="space-y-2">
                      {formData.existingFiles.map((file, index) => (
                        <div key={`existing-${index}`} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{file.name}</span>
                            {file.size && (
                              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingFile(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Hapus file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Files */}
                {formData.files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">File baru yang akan diupload:</p>
                    <div className="space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={`new-${index}`} className="flex items-center justify-between bg-green-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Hapus file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Link Terkait</label>
              <div className="space-y-3">
                {formData.links.map((link, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <LinkIcon className="w-4 h-4 text-gray-500 mt-2" />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={link.title || ''}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                          placeholder="Judul link (contoh: Dokumen Pendukung)"
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="url"
                          value={link.url || ''}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          placeholder="https://example.com"
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                      {formData.links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="text-red-500 hover:text-red-700 mt-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLink}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Tambah Link
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status Publikasi</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
                      className="mr-2"
                    />
                    Draft (Simpan ke Drive)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
                      className="mr-2"
                    />
                    Publish Sekarang
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="scheduled"
                      checked={formData.status === 'scheduled'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
                      className="mr-2"
                    />
                    Jadwalkan Publish
                  </label>
                </div>
                
                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jadwal Publish</label>
                    <input
                      type="datetime-local"
                      value={formData.jadwal_publish}
                      onChange={(e) => setFormData(prev => ({ ...prev, jadwal_publish: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.status === 'scheduled'}
                    />
                  </div>
                )}
                
                <div className="text-xs text-gray-500 bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold mb-1">📝 Keterangan Status:</p>
                  <ul className="space-y-1">
                    <li>• <strong>Draft:</strong> Disimpan otomatis, dapat dilanjutkan kapan saja</li>
                    <li>• <strong>Publish Sekarang:</strong> Langsung tampil di website publik</li>
                    <li>• <strong>Jadwalkan:</strong> Otomatis publish pada waktu yang ditentukan</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-700">
                <strong>Pejabat Penguasa Informasi:</strong> {getUserRole() === 'PPID_PELAKSANA' ? getUserName() || 'PPID Pelaksana' : getRoleDisplayName(getUserRole()) || 'PPID Diskominfo'}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
onClick={() => {
                  console.log('Submit button clicked');
                  // Let the form handle the submission
                }}
                className={`px-6 py-2 rounded font-medium flex items-center gap-2 ${
                  isSubmitting 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Menyimpan...
                  </>
                ) : (
                  editId ? 'Update' : 'Simpan'
                )}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false); 
                  setEditId(null); 
                  setFormData({ 
                    judul: '', 
                    klasifikasi: categories.length > 0 ? categories[0].slug : '', 
                    ringkasan_isi_informasi: '',
                    tanggal_posting: new Date().toISOString().split('T')[0],
                    thumbnail: '',
                    status: 'draft' as 'draft' | 'published' | 'scheduled',
                    jadwal_publish: '',
                    files: [],
                    existingFiles: [],
                    links: [{ title: '', url: '' }],
                    images: []
                  });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
      
      {selectedItems.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedItems.length} informasi dipilih
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkPublish}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
            >
              ✅ Publish
            </button>
            <button
              onClick={handleBulkDraft}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
            >
              📝 Draft
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === informasi.length && informasi.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klasifikasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pejabat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : informasi.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  {informasi.length === 0 ? 'Belum ada informasi publik' : 'Tidak ada informasi yang sesuai dengan filter'}
                </td>
              </tr>
            ) : (
              informasi.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.judul}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.klasifikasi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'draft' 
                        ? 'bg-orange-100 text-orange-800'
                        : item.status === 'scheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status === 'draft' ? '📝 Draft' : 
                       item.status === 'scheduled' ? '⏰ Terjadwal' : 
                       '✅ Published'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.pejabat_penguasa_informasi || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.tanggal_posting || item.created_at).toLocaleDateString('id-ID')}
                  </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </RoleGuard>
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </RoleGuard>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 p-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}