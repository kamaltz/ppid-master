"use client";

import React, { useState } from "react";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useKeberatanData } from "@/hooks/useKeberatanData";
import { X, MessageCircle, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";

interface KeberatanDisplay {
  id: number;
  nama: string;
  email: string;
  permintaan_id: number;
  judul: string;
  alasan_keberatan: string;
  status: string;
  tanggal: string;
}

export default function AdminKeberatanPage() {
  const { keberatan, isLoading, updateKeberatanStatus, deleteKeberatan } = useKeberatanData();
  const [selectedKeberatan, setSelectedKeberatan] = useState<KeberatanDisplay | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [ppidList, setPpidList] = useState<{id: number, nama: string, email: string}[]>([]);
  const [selectedPpid, setSelectedPpid] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchPpidList();
  }, []);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setPpidList([]);
      fetchPpidList(searchTerm, 1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  // Convert database data to display format
  const keberatanDisplay = keberatan.map(item => ({
    id: item.id,
    nama: item.pemohon?.nama || 'N/A',
    email: item.pemohon?.email || 'N/A',
    permintaan_id: item.permintaan_id,
    judul: item.alasan_keberatan || 'Tidak ada judul',
    alasan_keberatan: item.alasan_keberatan,
    status: item.status,
    tanggal: (() => {
      try {
        const date = new Date(item.created_at);
        return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID') : 'Tanggal tidak valid';
      } catch {
        return 'Tanggal tidak valid';
      }
    })()
  }));

  const updateStatus = (id: number, newStatus: string) => {
    const currentKeberatan = keberatanDisplay.find(k => k.id === id);
    if (!currentKeberatan) return;
    
    let title = '';
    let message = '';
    
    if (currentKeberatan.status === 'Diajukan' && newStatus === 'Diteruskan') {
      title = 'Proses Keberatan';
      message = `Yakin ingin memproses keberatan #${id}?`;
    } else if (currentKeberatan.status === 'Diteruskan' && newStatus === 'Selesai') {
      title = 'Selesaikan Keberatan';
      message = `Yakin ingin menyelesaikan keberatan #${id}?`;
    } else if (currentKeberatan.status === 'Diteruskan' && newStatus === 'Ditolak') {
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
        } catch {
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
        } catch {
          alert('Gagal menghapus keberatan');
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
      setSelectedIds(keberatanDisplay.map(k => k.id));
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

  const fetchPpidList = async (search = '', page = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = `/api/admin/assign-ppid?search=${encodeURIComponent(search)}&page=${page}&limit=10`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (page === 1) {
          setPpidList(data.data);
        } else {
          setPpidList(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch PPID list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPpidList(searchTerm, currentPage + 1);
    }
  };

  const handleBulkAssign = () => {
    if (selectedIds.length === 0) {
      alert('Pilih keberatan terlebih dahulu!');
      return;
    }
    fetchPpidList();
    setShowAssignModal(true);
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
            keberatanId: id,
            ppidId: parseInt(selectedPpid),
            type: 'keberatan'
          })
        });
        if (!response.ok) {
          throw new Error('Failed to assign keberatan');
        }
      }
      setShowAssignModal(false);
      setSelectedIds([]);
      setSelectAll(false);
      setSelectedPpid('');
      window.location.reload();
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Gagal menugaskan keberatan');
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
        <h1 className="text-3xl font-bold text-gray-800">Kelola Keberatan</h1>
        <div className="text-sm text-gray-500">
          Total: {keberatanDisplay.length} keberatan
        </div>
      </div>
      
      {/* Bulk Actions */}
      <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedIds.length} keberatan dipilih
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAssign()}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Teruskan Semua
                </button>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permintaan ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.permintaan_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.judul}</td>
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
                      ) : null}
                      {item.status === 'Diteruskan' && (
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
                      <Link
                        href={`/admin/keberatan/${item.id}`}
                        className="text-green-600 hover:text-green-900 text-xs mr-2 inline-flex items-center"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {item.status === 'Diteruskan' ? 'Chat' : 'Respon'}
                      </Link>
                    </RoleGuard>
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
              <h3 className="text-lg font-semibold text-red-600">Detail Keberatan</h3>
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
                <p className="text-gray-900 whitespace-pre-wrap">{selectedKeberatan.alasan_keberatan}</p>
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
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isLoading={isProcessing}
      />

      {/* PPID Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Teruskan ke PPID Pelaksana</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedIds.length} keberatan akan diteruskan ke PPID Pelaksana yang dipilih
            </p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari PPID Pelaksana..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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