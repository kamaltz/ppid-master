"use client";

import React, { useState, useEffect } from "react";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { updatePermintaanStatus } from "@/lib/api";
import { X, CheckSquare, Square, Eye, User, Mail, Phone, MapPin, Briefcase, Calendar, CreditCard, FileText } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

interface Permohonan {
  id: number;
  nama: string;
  email: string;
  informasi: string;
  status: string;
  tanggal: string;
}

export default function AdminPermohonanPage() {
  const { permintaan, isLoading, refreshData } = useDashboardData();
  const [selectedPermohonan, setSelectedPermohonan] = useState<Permohonan | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'success';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'warning', onConfirm: () => {} });
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [ppidList, setPpidList] = useState<{id: number, nama: string, email: string}[]>([]);
  const [selectedPpid, setSelectedPpid] = useState('');
  const [pemohonDetails, setPemohonDetails] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Convert database data to component format with filtering and sorting
  const filteredAndSortedPermohonan = permintaan
    .map(req => {
      let tanggalDisplay = 'Tanggal tidak tersedia';
      try {
        const date = new Date(req.created_at);
        if (!isNaN(date.getTime())) {
          tanggalDisplay = date.toLocaleDateString('id-ID');
        }
      } catch {
        // Keep default value
      }
      
      return {
        id: req.id,
        nama: req.pemohon?.nama || 'N/A',
        email: req.pemohon?.email || 'N/A',
        informasi: req.rincian_informasi,
        status: req.status,
        tanggal: tanggalDisplay,
        created_at: req.created_at
      };
    })
    .filter(item => {
      // Search filter
      const searchMatch = !searchQuery || 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.informasi.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const statusMatch = !statusFilter || item.status === statusFilter;
      
      // Date range filter
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const itemDate = new Date(item.created_at);
        if (dateFrom && itemDate < new Date(dateFrom)) dateMatch = false;
        if (dateTo && itemDate > new Date(dateTo + 'T23:59:59')) dateMatch = false;
      }
      
      return searchMatch && statusMatch && dateMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'nama') {
        aValue = a.nama.toLowerCase();
        bValue = b.nama.toLowerCase();
      } else if (sortBy === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else {
        aValue = a[sortBy as keyof typeof a];
        bValue = b[sortBy as keyof typeof b];
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  
  // Pagination logic
  const totalItems = filteredAndSortedPermohonan.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPageNum - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const permohonan = filteredAndSortedPermohonan.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPageNum(page);
  };
  
  const goToPrevious = () => {
    if (currentPageNum > 1) setCurrentPageNum(currentPageNum - 1);
  };
  
  const goToNext = () => {
    if (currentPageNum < totalPages) setCurrentPageNum(currentPageNum + 1);
  };

  const updateStatus = (id: number, newStatus: string) => {
    const currentPermohonan = permohonan.find(p => p.id === id);
    if (!currentPermohonan) return;
    
    let title = '';
    let message = '';
    let successTitle = '';
    let successMessage = '';
    let type: 'warning' | 'danger' | 'success' = 'warning';
    
    if (currentPermohonan.status === 'Diajukan' && newStatus === 'Diproses') {
      title = 'Proses Permohonan';
      message = `Apakah Anda yakin ingin memproses permohonan #${id} dari ${currentPermohonan.nama}? Permohonan akan diteruskan ke PPID Pelaksana.`;
      successTitle = 'Berhasil Diproses';
      successMessage = `Permohonan #${id} berhasil diteruskan ke PPID Pelaksana.`;
      type = 'success';
    } else if (currentPermohonan.status === 'Diteruskan' && newStatus === 'Selesai') {
      title = 'Selesaikan Permohonan';
      message = `Apakah Anda yakin ingin menyelesaikan permohonan #${id}? Pemohon akan mendapatkan notifikasi bahwa permohonan telah selesai.`;
      successTitle = 'Permohonan Selesai';
      successMessage = `Permohonan #${id} berhasil diselesaikan. Pemohon telah diberitahu melalui email.`;
      type = 'success';
    } else if (currentPermohonan.status === 'Diteruskan' && newStatus === 'Ditolak') {
      title = 'Tolak Permohonan';
      message = `Apakah Anda yakin ingin menolak permohonan #${id}? Tindakan ini tidak dapat dibatalkan dan pemohon akan diberitahu.`;
      successTitle = 'Permohonan Ditolak';
      successMessage = `Permohonan #${id} telah ditolak. Pemohon akan menerima notifikasi penolakan.`;
      type = 'danger';
    }
    
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) throw new Error('No token found');
          
          await updatePermintaanStatus(id.toString(), { status: newStatus }, token);
          setConfirmModal({ ...confirmModal, isOpen: false });
          setSuccessModal({ isOpen: true, title: successTitle, message: successMessage });
          refreshData();
        } catch {
          alert('Gagal mengupdate status');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const deletePermohonan = (id: number) => {
    const item = permohonan.find(p => p.id === id);
    if (!item) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Permohonan',
      message: `Apakah Anda yakin ingin menghapus permohonan #${id} dari ${item.nama}? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang permanen.`,
      type: 'danger',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) throw new Error('No token found');
          
          const response = await fetch(`/api/permintaan/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
      if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); console.error('Delete error:', errorData); throw new Error(errorData.error || `HTTP ${response.status}`);
      }
          

          
          setConfirmModal({ ...confirmModal, isOpen: false });
          setSuccessModal({
            isOpen: true,
            title: 'Berhasil Dihapus',
            message: `Permohonan #${id} berhasil dihapus dari sistem.`
          });
          refreshData();
        } catch (error) {
          console.error('Delete error:', error);
          alert(`Gagal menghapus permohonan: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(permohonan.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleSelectItem = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) {
      alert('Pilih permohonan terlebih dahulu!');
      return;
    }
    
    let title = '';
    let message = '';
    let successTitle = '';
    let successMessage = '';
    let type: 'warning' | 'danger' | 'success' = 'warning';
    
    switch (action) {
      case 'terima':
        title = 'Proses Massal';
        message = `Apakah Anda yakin ingin meneruskan ${selectedIds.length} permohonan sekaligus? Semua permohonan akan diteruskan ke PPID Pelaksana.`;
        successTitle = 'Berhasil Diproses';
        successMessage = `${selectedIds.length} permohonan berhasil diteruskan.`;
        type = 'success';
        break;
      case 'tolak':
        title = 'Tolak Massal';
        message = `Apakah Anda yakin ingin menolak ${selectedIds.length} permohonan sekaligus? Tindakan ini tidak dapat dibatalkan.`;
        successTitle = 'Berhasil Ditolak';
        successMessage = `${selectedIds.length} permohonan berhasil ditolak.`;
        type = 'danger';
        break;
      case 'hapus':
        title = 'Hapus Massal';
        message = `Apakah Anda yakin ingin menghapus ${selectedIds.length} permohonan sekaligus? Tindakan ini tidak dapat dibatalkan dan semua data akan hilang permanen.`;
        successTitle = 'Berhasil Dihapus';
        successMessage = `${selectedIds.length} permohonan berhasil dihapus dari sistem.`;
        type = 'danger';
        break;
    }
    
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) throw new Error('No token found');
          
          if (action === 'hapus') {
            // Delete each selected request
            for (const id of selectedIds) {
              const response = await fetch(`/api/permintaan/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
      if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); console.error('Bulk delete error:', errorData); throw new Error(errorData.error || `HTTP ${response.status}`);
      }

            }
          } else {
            // Update status for each selected request
            const newStatus = action === 'terima' ? 'Diteruskan' : 'Ditolak';
            for (const id of selectedIds) {
              await updatePermintaanStatus(id.toString(), { status: newStatus }, token);
            }
          }
          
          setConfirmModal({ ...confirmModal, isOpen: false });
          setSuccessModal({ isOpen: true, title: successTitle, message: successMessage });
          setSelectedIds([]);
          setSelectAll(false);
          refreshData();
        } catch (error) {
          console.error('Bulk action error:', error);
          alert('Gagal melakukan aksi massal');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const loadPpidList = async (page = 1, search = '') => {
    if (loading) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch(`/api/admin/assign-ppid?search=${encodeURIComponent(search)}&page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setPpidList((data?.data || []) || []);
        } else {
          setPpidList(prev => [...prev, ...((data?.data || []) || [])]);
        }
        setHasMore(data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to load PPID list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadPpidList(nextPage, searchTerm);
    }
  };

  const handleBulkAssign = () => {
    if (selectedIds.length === 0) {
      alert('Pilih permohonan terlebih dahulu!');
      return;
    }
    // Reset and load PPID list
    setPpidList([]);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedPpid('');
    setShowAssignModal(true);
    loadPpidList(1, '');
  };

  const assignToPpid = async () => {
    if (!selectedPpid) {
      alert('Pilih PPID Pelaksana!');
      return;
    }
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      for (const id of selectedIds) {
        const response = await fetch('/api/admin/assign-ppid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            requestId: id,
            ppidId: parseInt(selectedPpid),
            type: 'request'
          })
        });
        if (!response.ok) {
          throw new Error('Failed to assign request');
        }
      }
      setShowAssignModal(false);
      setSelectedIds([]);
      setSelectAll(false);
      setSelectedPpid('');
      refreshData();
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Gagal menugaskan permohonan');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diajukan': return 'bg-yellow-100 text-yellow-800';
      case 'Diteruskan': return 'bg-blue-100 text-blue-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Ditolak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Permohonan</h1>
        <div className="text-sm text-gray-500">
          Menampilkan: {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} permohonan (Total: {permintaan.length})
        </div>
      </div>
      
      {/* Bulk Actions */}
      <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedIds.length} permohonan dipilih
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAssign()}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Teruskan Semua
                </button>
                <button
                  onClick={() => handleBulkAction('tolak')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Tolak Semua
                </button>
                <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
                  <button
                    onClick={() => handleBulkAction('hapus')}
                    className="px-3 py-1 bg-red-800 text-white text-sm rounded hover:bg-red-900"
                  >
                    Hapus Semua
                  </button>
                </RoleGuard>
                <button
                  onClick={() => {setSelectedIds([]); setSelectAll(false);}}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </RoleGuard>
      
      {/* Filter Toggle Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </button>
      </div>
      
      {/* Search and Filter Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
            <input
              type="text"
              placeholder="Cari nama, email, atau topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua Status</option>
              <option value="Diajukan">Diajukan</option>
              <option value="Diteruskan">Diteruskan</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="created_at-desc">Tanggal Terbaru</option>
              <option value="created_at-asc">Tanggal Terlama</option>
              <option value="nama-asc">Nama A-Z</option>
              <option value="nama-desc">Nama Z-A</option>
            </select>
          </div>
          
          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Halaman</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPageNum(1);
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        {/* Date Range and Reset */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setDateFrom('');
                setDateTo('');
                setSortBy('created_at');
                setSortOrder('desc');
                setCurrentPageNum(1);
              }}
              className="w-full px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
            >
              Reset Filter
            </button>
          </div>
        </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {selectAll ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
              </RoleGuard>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Informasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
            ) : permohonan.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Belum ada permohonan
                </td>
              </tr>
            ) : (
              permohonan.map((item) => (
              <tr key={item.id} className={selectedIds.includes(item.id) ? 'bg-blue-50' : ''}>
                <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSelectItem(item.id)}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {selectedIds.includes(item.id) ? 
                        <CheckSquare className="w-4 h-4 text-blue-600" /> : 
                        <Square className="w-4 h-4" />
                      }
                    </button>
                  </td>
                </RoleGuard>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.informasi}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tanggal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                    {item.status === 'Diajukan' ? (
                      <span className="text-xs text-yellow-600">Menunggu</span>
                    ) : item.status === 'Diteruskan' ? (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => updateStatus(item.id, 'Selesai')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Selesai
                        </button>
                        <button 
                          onClick={() => updateStatus(item.id, 'Ditolak')}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Selesai diproses</span>
                    )}
                  </RoleGuard>
                  <button 
                    onClick={() => setSelectedPermohonan(item)}
                    className="text-blue-600 hover:text-blue-900 text-xs mr-2"
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    Detail
                  </button>
                  {item.status === 'Diajukan' && (
                    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
                      <button
                        onClick={() => {
                          setSelectedIds([item.id]);
                          handleBulkAssign();
                        }}
                        className="text-green-600 hover:text-green-900 text-xs mr-2"
                      >
                        Teruskan
                      </button>
                    </RoleGuard>
                  )}
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                    <a 
                      href={`/admin/permohonan/${item.id}`}
                      className="text-green-600 hover:text-green-900 text-xs mr-2"
                    >
                      {item.status === 'Diteruskan' ? 'Chat' : 'Respon'}
                    </a>
                  </RoleGuard>
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
                    <button 
                      onClick={() => deletePermohonan(item.id)}
                      className="text-red-600 hover:text-red-900 text-xs"
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
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Halaman {currentPageNum} dari {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevious}
                disabled={currentPageNum === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPageNum <= 3) {
                    pageNum = i + 1;
                  } else if (currentPageNum >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPageNum - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 border rounded-lg ${
                        currentPageNum === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={goToNext}
                disabled={currentPageNum === totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Detail Modal */}
      {selectedPermohonan && (
        <DetailPermohonanModal 
          permohonan={selectedPermohonan}
          onClose={() => setSelectedPermohonan(null)}
          getStatusColor={getStatusColor}
        />
      )}
      
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        isLoading={isProcessing}
      />
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />

      {/* PPID Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Teruskan ke PPID Pelaksana</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedIds.length} permohonan akan diteruskan ke PPID Pelaksana yang dipilih
            </p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari PPID Pelaksana..."
                value={searchTerm}
                onChange={(e) => {
                  const newSearch = e.target.value;
                  setSearchTerm(newSearch);
                  setPpidList([]);
                  setCurrentPage(1);
                  setHasMore(true);
                  // Debounce search
                  setTimeout(() => {
                    if (searchTerm === newSearch) {
                      loadPpidList(1, newSearch);
                    }
                  }, 300);
                }}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div 
              className="space-y-2 max-h-60 overflow-y-auto"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
                  loadMore();
                }
              }}
            >
              {ppidList.length === 0 && !loading ? (
                <p className="text-gray-500 text-center py-4">Tidak ada PPID ditemukan</p>
              ) : (
                ppidList.map((ppid) => (
                  <label key={ppid.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="ppid"
                      value={ppid.id}
                      checked={selectedPpid === ppid.id.toString()}
                      onChange={(e) => setSelectedPpid(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{ppid.nama}</div>
                      <div className="text-sm text-gray-500">{ppid.email}</div>
                    </div>
                  </label>
                ))
              )}
              {loading && (
                <div className="text-center py-2">
                  <span className="text-gray-500">Loading...</span>
                </div>
              )}
              {!hasMore && ppidList.length > 0 && (
                <div className="text-center py-2">
                  <span className="text-gray-400 text-sm">Semua PPID telah dimuat</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPpid('');
                  setPpidList([]);
                  setCurrentPage(1);
                  setSearchTerm('');
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={assignToPpid}
                disabled={!selectedPpid || isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Memproses...' : 'Teruskan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Detail Modal Component
function DetailPermohonanModal({ permohonan, onClose, getStatusColor }: {
  permohonan: Permohonan;
  onClose: () => void;
  getStatusColor: (status: string) => string;
}) {
  const [pemohonDetails, setPemohonDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPemohonDetails = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/accounts/pemohon/${permohonan.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPemohonDetails(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch pemohon details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPemohonDetails();
  }, [permohonan.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail Permohonan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Request Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informasi Permohonan</h3>
                
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">ID Permohonan</p>
                    <p className="font-medium text-gray-900">{permohonan.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Pengajuan</p>
                    <p className="font-medium text-gray-900">{permohonan.tanggal}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(permohonan.status).includes('yellow') ? 'bg-yellow-500' : getStatusColor(permohonan.status).includes('green') ? 'bg-green-500' : getStatusColor(permohonan.status).includes('red') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(permohonan.status)}`}>
                      {permohonan.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Informasi yang Diminta</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900 leading-relaxed">{permohonan.informasi}</p>
                  </div>
                </div>
              </div>
              
              {/* Pemohon Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Data Pemohon</h3>
                
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : pemohonDetails ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Nama Lengkap</p>
                        <p className="font-medium text-gray-900">{pemohonDetails.nama}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">NIK</p>
                        <p className="font-medium text-gray-900">{pemohonDetails.nik}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{pemohonDetails.email}</p>
                      </div>
                    </div>
                    
                    {pemohonDetails.no_telepon && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">No. Telepon</p>
                          <p className="font-medium text-gray-900">{pemohonDetails.no_telepon}</p>
                        </div>
                      </div>
                    )}
                    
                    {pemohonDetails.pekerjaan && (
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Pekerjaan</p>
                          <p className="font-medium text-gray-900">{pemohonDetails.pekerjaan}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">Data pemohon tidak ditemukan</p>
                )}
              </div>
            </div>
            
            {/* KTP Image and Address */}
            {pemohonDetails && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* KTP Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Foto KTP</h3>
                  {pemohonDetails.ktp_image ? (
                    <div className="space-y-3">
                      <img
                        src={pemohonDetails.ktp_image}
                        alt="KTP"
                        className="w-full h-auto rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => window.open(pemohonDetails.ktp_image, '_blank')}
                        onError={(e) => {
                          console.error('Image load error:', pemohonDetails.ktp_image);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMyMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxNjAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3Mjg0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HYW1iYXIgS1RQIHR0aWRhayBkYXBhdCBkaW11YXQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Klik gambar untuk memperbesar
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Tidak ada foto KTP</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Alamat</h3>
                  {pemohonDetails.alamat ? (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Alamat Lengkap</p>
                        <p className="font-medium text-gray-900 leading-relaxed">{pemohonDetails.alamat}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Alamat tidak tersedia</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}