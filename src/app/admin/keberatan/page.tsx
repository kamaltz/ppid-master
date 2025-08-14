"use client";

import { useState } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useKeberatanData } from "@/hooks/useKeberatanData";
import { X } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

interface KeberatanDisplay {
  id: number;
  nama: string;
  email: string;
  permintaan_id: number;
  alasan_keberatan: string;
  status: string;
  tanggal: string;
}

export default function AdminKeberatanPage() {
  const { userRole } = useRoleAccess();
  const { keberatan, isLoading, updateKeberatanStatus, deleteKeberatan } = useKeberatanData();
  const [selectedKeberatan, setSelectedKeberatan] = useState<KeberatanDisplay | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Convert database data to display format
  const keberatanDisplay = keberatan.map(item => ({
    id: item.id,
    nama: item.pemohon?.nama || 'N/A',
    email: item.pemohon?.email || 'N/A',
    permintaan_id: item.permintaan_id,
    alasan_keberatan: item.alasan_keberatan,
    status: item.status,
    tanggal: (() => {
      try {
        const date = new Date(item.created_at || item.tanggal_keberatan);
        return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID') : 'Tanggal tidak valid';
      } catch (e) {
        return 'Tanggal tidak valid';
      }
    })()
  }));

  const updateStatus = (id: number, newStatus: string) => {
    const currentKeberatan = keberatanDisplay.find(k => k.id === id);
    if (!currentKeberatan) return;
    
    let title = '';
    let message = '';
    
    if (currentKeberatan.status === 'Diajukan' && newStatus === 'Diproses') {
      title = 'Proses Keberatan';
      message = `Yakin ingin memproses keberatan #${id}?`;
    } else if (currentKeberatan.status === 'Diproses' && newStatus === 'Selesai') {
      title = 'Selesaikan Keberatan';
      message = `Yakin ingin menyelesaikan keberatan #${id}?`;
    } else if (currentKeberatan.status === 'Diproses' && newStatus === 'Ditolak') {
      title = 'Tolak Keberatan';
      message = `Yakin ingin menolak keberatan #${id}? Tindakan ini tidak dapat dibatalkan.`;
    }
    
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await updateKeberatanStatus(id, { status: newStatus });
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (error) {
          alert('Gagal mengupdate status keberatan');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleDelete = (id: number) => {
    const item = keberatanDisplay.find(k => k.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Keberatan',
      message: `Yakin ingin menghapus keberatan #${id} dari "${item?.nama}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await deleteKeberatan(id);
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (error) {
          alert('Gagal menghapus keberatan');
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Kelola Keberatan</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permintaan ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
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
            ) : keberatanDisplay.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Belum ada keberatan
                </td>
              </tr>
            ) : (
              keberatanDisplay.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.permintaan_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.alasan_keberatan}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tanggal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.ATASAN_PPID, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                      {item.status === 'Diajukan' && (
                        <button 
                          onClick={() => updateStatus(item.id, 'Diproses')}
                          className="text-blue-600 hover:text-blue-900 text-xs"
                        >
                          Proses
                        </button>
                      )}
                      {item.status === 'Diproses' && (
                        <>
                          <button 
                            onClick={() => updateStatus(item.id, 'Selesai')}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Selesai
                          </button>
                          <button 
                            onClick={() => updateStatus(item.id, 'Ditolak')}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </RoleGuard>
                    <button 
                      onClick={() => setSelectedKeberatan(item)}
                      className="text-blue-600 hover:text-blue-900 text-xs mr-2"
                    >
                      Detail
                    </button>
                    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                      <button 
                        onClick={() => handleDelete(item.id)}
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
      {selectedKeberatan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detail Keberatan</h3>
              <button 
                onClick={() => setSelectedKeberatan(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID Keberatan</label>
                <p className="text-gray-900">{selectedKeberatan.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Nama Pemohon</label>
                <p className="text-gray-900">{selectedKeberatan.nama}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{selectedKeberatan.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Permintaan ID</label>
                <p className="text-gray-900">{selectedKeberatan.permintaan_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Alasan Keberatan</label>
                <p className="text-gray-900">{selectedKeberatan.alasan_keberatan}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedKeberatan.status)}`}>
                  {selectedKeberatan.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                <p className="text-gray-900">{selectedKeberatan.tanggal}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedKeberatan(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isLoading={isProcessing}
      />
    </div>
  );
}