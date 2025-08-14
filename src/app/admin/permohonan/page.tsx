"use client";

import React, { useState } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { updatePermintaanStatus } from "@/lib/api";
import { X, CheckSquare, Square } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

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
      informasi: req.judul || req.rincian_informasi,
      tujuan_penggunaan: req.tujuan_penggunaan,
      cara_memperoleh_informasi: req.cara_memperoleh_informasi,
      cara_mendapat_salinan: req.cara_mendapat_salinan,
      status: req.status,
      tanggal: tanggalDisplay
    };
  });

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
      successMessage = `Permohonan #${id} berhasil diterima dan sedang diproses oleh PPID Pelaksana.`;
      type = 'success';
    } else if (currentPermohonan.status === 'Diproses' && newStatus === 'Selesai') {
      title = 'Selesaikan Permohonan';
      message = `Apakah Anda yakin ingin menyelesaikan permohonan #${id}? Pemohon akan mendapatkan notifikasi bahwa permohonan telah selesai.`;
      successTitle = 'Permohonan Selesai';
      successMessage = `Permohonan #${id} berhasil diselesaikan. Pemohon telah diberitahu melalui email.`;
      type = 'success';
    } else if (currentPermohonan.status === 'Diproses' && newStatus === 'Ditolak') {
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
        } catch (error) {
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
          
          if (!response.ok) throw new Error('Failed to delete');
          
          setConfirmModal({ ...confirmModal, isOpen: false });
          setSuccessModal({
            isOpen: true,
            title: 'Berhasil Dihapus',
            message: `Permohonan #${id} berhasil dihapus dari sistem.`
          });
          refreshData();
        } catch (error) {
          alert('Gagal menghapus permohonan');
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
        message = `Apakah Anda yakin ingin memproses ${selectedIds.length} permohonan sekaligus? Semua permohonan akan diteruskan ke PPID Pelaksana.`;
        successTitle = 'Berhasil Diproses';
        successMessage = `${selectedIds.length} permohonan berhasil diterima dan sedang diproses.`;
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
                throw new Error(`Failed to delete request ${id}`);
              }
            }
          } else {
            // Update status for each selected request
            const newStatus = action === 'terima' ? 'Diproses' : 'Ditolak';
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
      <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
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
    </div>
  );
}