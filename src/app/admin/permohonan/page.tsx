"use client";

import React, { useState } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { updatePermintaanStatus } from "@/lib/api";
import { X, CheckSquare, Square } from "lucide-react";

interface Permohonan {
  id: number;
  nama: string;
  email: string;
  informasi: string;
  tujuan_penggunaan?: string;
  cara_memperoleh_informasi?: string;
  cara_mendapat_salinan?: string;
  status: string;
  tanggal: string;
}

export default function AdminPermohonanPage() {
  const { userRole } = useRoleAccess();
  const { permintaan, isLoading, refreshData } = useDashboardData();
  const [selectedPermohonan, setSelectedPermohonan] = useState<Permohonan | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Convert database data to component format
  const permohonan = permintaan.map(req => {
    let tanggalDisplay = 'Tanggal tidak tersedia';
    try {
      const date = new Date(req.created_at);
      if (!isNaN(date.getTime())) {
        tanggalDisplay = date.toLocaleDateString('id-ID');
      }
    } catch (e) {
      // Keep default value
    }
    
    return {
      id: req.id,
      nama: req.pemohon?.nama || 'N/A',
      email: req.pemohon?.email || 'N/A',
      informasi: req.rincian_informasi,
      tujuan_penggunaan: req.tujuan_penggunaan,
      cara_memperoleh_informasi: req.cara_memperoleh_informasi,
      cara_mendapat_salinan: req.cara_mendapat_salinan,
      status: req.status,
      tanggal: tanggalDisplay
    };
  });

  const updateStatus = async (id: number, newStatus: string) => {
    const currentPermohonan = permohonan.find(p => p.id === id);
    if (!currentPermohonan) return;
    
    let confirmMessage = '';
    let successMessage = '';
    
    if (currentPermohonan.status === 'Diajukan' && newStatus === 'Diproses') {
      confirmMessage = `Yakin ingin menerima dan memproses permohonan ${id}?`;
      successMessage = `Permohonan ${id} diterima dan sedang diproses`;
    } else if (currentPermohonan.status === 'Diproses' && newStatus === 'Selesai') {
      confirmMessage = `Yakin ingin menyelesaikan permohonan ${id}?`;
      successMessage = `Permohonan ${id} berhasil diselesaikan`;
    } else if (currentPermohonan.status === 'Diproses' && newStatus === 'Ditolak') {
      confirmMessage = `Yakin ingin menolak permohonan ${id}? Tindakan ini tidak dapat dibatalkan.`;
      successMessage = `Permohonan ${id} ditolak`;
    }
    
    if (confirmMessage && confirm(confirmMessage)) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        
        await updatePermintaanStatus(id.toString(), { status: newStatus }, token);
        alert(successMessage);
        refreshData(); // Refresh data after update
      } catch (error) {
        alert('Gagal mengupdate status');
      }
    }
  };

  const deletePermohonan = async (id: number) => {
    const item = permohonan.find(p => p.id === id);
    if (confirm(`Yakin ingin menghapus permohonan ${id} dari "${item?.nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permintaan/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to delete');
        
        alert(`Permohonan ${id} berhasil dihapus`);
        refreshData(); // Refresh data after delete
      } catch (error) {
        alert('Gagal menghapus permohonan');
      }
    }
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
    
    let confirmMessage = '';
    let successMessage = '';
    
    switch (action) {
      case 'terima':
        confirmMessage = `Yakin ingin menerima ${selectedIds.length} permohonan yang dipilih?`;
        successMessage = `${selectedIds.length} permohonan berhasil diterima`;
        break;
      case 'tolak':
        confirmMessage = `Yakin ingin menolak ${selectedIds.length} permohonan yang dipilih?`;
        successMessage = `${selectedIds.length} permohonan berhasil ditolak`;
        break;
      case 'hapus':
        confirmMessage = `Yakin ingin menghapus ${selectedIds.length} permohonan yang dipilih? Tindakan ini tidak dapat dibatalkan.`;
        successMessage = `${selectedIds.length} permohonan berhasil dihapus`;
        break;
    }
    
    if (confirm(confirmMessage)) {
      alert(successMessage);
      setSelectedIds([]);
      setSelectAll(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diajukan': return 'bg-yellow-100 text-yellow-800';
      case 'Diproses': return 'bg-blue-100 text-blue-800';
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
          Total: {permohonan.length} permohonan
        </div>
      </div>
      
      {/* Bulk Actions */}
      <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedIds.length} permohonan dipilih
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('terima')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Terima Semua
                </button>
                <button
                  onClick={() => handleBulkAction('tolak')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Tolak Semua
                </button>
                <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
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
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
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
                <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
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
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                    {item.status === 'Diajukan' ? (
                      <button 
                        onClick={() => updateStatus(item.id, 'Diproses')}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Proses
                      </button>
                    ) : item.status === 'Diproses' ? (
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
                    Detail
                  </button>
                  <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
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
      
      {/* Detail Modal */}
      {selectedPermohonan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detail Permohonan</h3>
              <button 
                onClick={() => setSelectedPermohonan(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID Permohonan</label>
                <p className="text-gray-900">{selectedPermohonan.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Nama Pemohon</label>
                <p className="text-gray-900">{selectedPermohonan.nama}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{selectedPermohonan.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Informasi Diminta</label>
                <p className="text-gray-900">{selectedPermohonan.informasi}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tujuan Penggunaan</label>
                <p className="text-gray-900">{selectedPermohonan.tujuan_penggunaan || 'Tidak ada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cara Memperoleh Informasi</label>
                <p className="text-gray-900">{selectedPermohonan.cara_memperoleh_informasi || 'Tidak ada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cara Mendapat Salinan</label>
                <p className="text-gray-900">{selectedPermohonan.cara_mendapat_salinan || 'Tidak ada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPermohonan.status)}`}>
                  {selectedPermohonan.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                <p className="text-gray-900">{selectedPermohonan.tanggal}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedPermohonan(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}