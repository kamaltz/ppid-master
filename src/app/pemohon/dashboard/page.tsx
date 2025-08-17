"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, FileText, Clock, CheckCircle, AlertTriangle, X, Download, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import AccessibilityHelper from "@/components/accessibility/AccessibilityHelper";
import { usePemohonData } from "@/hooks/usePemohonData";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmationModal from "@/components/ConfirmationModal";

interface PermintaanData {
  id: number;
  judul?: string;
  rincian_informasi: string;
  tujuan_penggunaan?: string;
  cara_memperoleh_informasi?: string;
  cara_mendapat_salinan?: string;
  status: string;
  created_at: string;
  catatan_ppid?: string;
  file_attachments?: string | string[];
}

interface KeberatanData {
  id: number;
  judul?: string;
  alasan_keberatan?: string;
  status?: string;
  created_at: string;
}

export default function PemohonDashboardPage() {
  const [selectedRequest, setSelectedRequest] = useState<PermintaanData | null>(null);
  const { permintaan, stats, isLoading } = usePemohonData();
  useAuth();
  const router = useRouter();
  const [keberatan, setKeberatan] = useState<KeberatanData[]>([]);
  const [loadingKeberatan, setLoadingKeberatan] = useState(true);

  // Fetch keberatan data
  useEffect(() => {
    const fetchKeberatan = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoadingKeberatan(false);
        return;
      }
      
      try {
        
        const response = await fetch('/api/keberatan', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setKeberatan(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch keberatan:', error);
      } finally {
        setLoadingKeberatan(false);
      }
    };

    fetchKeberatan();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diajukan": return "text-purple-600 bg-purple-100";
      case "Diproses": return "text-indigo-600 bg-indigo-100";
      case "Selesai": return "text-green-600 bg-green-100";
      case "Ditolak": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case "Diajukan": return "Verifikasi PPID Utama";
      case "Diproses": return "Diproses PPID Pelaksana";
      case "Selesai": return "Selesai";
      case "Ditolak": return "Ditolak";
      default: return status;
    }
  };

  const getDetailedStatus = (status: string) => {
    switch (status) {
      case "Diajukan": return "Sedang diverifikasi oleh PPID Utama";
      case "Diproses": return "Sedang diproses oleh PPID Pelaksana";
      case "Selesai": return "Permohonan telah selesai";
      case "Ditolak": return "Permohonan ditolak";
      default: return status;
    }
  };
  

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showKeberatanModal, setShowKeberatanModal] = useState(false);
  const [selectedKeberatanId, setSelectedKeberatanId] = useState<string>('');
  
  const handleWithdrawRequest = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Tarik Permohonan',
      message: `Apakah Anda yakin ingin menarik kembali permohonan #${id}? Tindakan ini tidak dapat dibatalkan dan permohonan akan dihapus dari sistem.`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          setConfirmModal({ ...confirmModal, isOpen: false });
          setSuccessModal({
            isOpen: true,
            title: 'Berhasil Ditarik',
            message: `Permohonan #${id} berhasil ditarik kembali dari sistem.`
          });
        } catch {
          alert('Gagal menarik permohonan');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };
  
  const handleWithdrawKeberatan = (id: string) => {
    setSelectedKeberatanId(id);
    setShowKeberatanModal(true);
  };

  const handleConfirmKeberatanWithdraw = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowKeberatanModal(false);
      setSuccessModal({
        isOpen: true,
        title: 'Berhasil Ditarik',
        message: `Keberatan #${selectedKeberatanId} berhasil ditarik kembali dari sistem.`
      });
    } catch {
      alert('Gagal menarik keberatan');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/permohonan">
            <button className="flex items-center px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg">
              <PlusCircle className="mr-2 w-5 h-5" />
              Ajukan Permohonan
            </button>
          </Link>
          <Link href="/pemohon/keberatan">
            <button className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">
              <AlertTriangle className="mr-2 w-5 h-5" />
              Ajukan Keberatan
            </button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Permohonan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Diproses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.diproses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-gray-900">{stats.selesai}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Permohonan */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Permohonan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : permintaan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Belum ada permohonan
                  </td>
                </tr>
              ) : (
                permintaan.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(request as PermintaanData).judul || request.rincian_informasi.substring(0, 50) + '...'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getDisplayStatus(request.status)}
                        </span>
                        <p className="text-xs text-gray-500">
                          {getDetailedStatus(request.status)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(() => {
                        try {
                          const date = new Date(request.created_at);
                          return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID') : 'Tanggal tidak tersedia';
                        } catch {
                          return 'Tanggal tidak tersedia';
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button 
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Detail
                      </button>
                      {(request.status === 'Diproses' || request.status === 'Diajukan') && (
                        <>
                          <button 
                            onClick={() => handleWithdrawRequest(request.id.toString())}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Tarik
                          </button>
                          <button 
                            onClick={() => router.push(`/pemohon/keberatan?permintaan_id=${request.id}`)}
                            className="text-orange-600 hover:text-orange-900 text-xs"
                          >
                            Ajukan Keberatan
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Riwayat Keberatan */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Keberatan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul Keberatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingKeberatan ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : keberatan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Belum ada keberatan
                  </td>
                </tr>
              ) : (
                keberatan.map((item: KeberatanData) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.judul || item.alasan_keberatan?.substring(0, 50) + '...'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status || 'Diajukan')}`}>
                        {item.status || 'Diajukan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(() => {
                        try {
                          const date = new Date(item.created_at);
                          return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID') : 'Tanggal tidak tersedia';
                        } catch {
                          return 'Tanggal tidak tersedia';
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Detail
                      </button>
                      {(item.status === 'Diproses' || item.status === 'Diajukan' || !item.status) && (
                        <button 
                          onClick={() => handleWithdrawKeberatan(item.id.toString())}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Tarik
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detail Permohonan</h3>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">ID Permohonan</label>
                <p className="text-gray-900">{selectedRequest.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Informasi Diminta</label>
                <p className="text-gray-900">{selectedRequest.rincian_informasi}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tujuan Penggunaan</label>
                <p className="text-gray-900">{selectedRequest.tujuan_penggunaan || 'Tidak ada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cara Memperoleh Informasi</label>
                <p className="text-gray-900">{selectedRequest.cara_memperoleh_informasi || 'Tidak ada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cara Mendapat Salinan</label>
                <p className="text-gray-900">{selectedRequest.cara_mendapat_salinan || 'Tidak ada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">File Lampiran</label>
                <div className="mt-2 space-y-2">
                  {(() => {
                    console.log('Full request object:', selectedRequest);
                    console.log('File attachments:', selectedRequest.file_attachments);
                    console.log('Type:', typeof selectedRequest.file_attachments);
                    
                    if (!selectedRequest.file_attachments) {
                      return <span className="text-sm text-gray-500">Tidak ada file lampiran</span>;
                    }
                    
                    try {
                      let files = selectedRequest.file_attachments;
                      if (typeof files === 'string') {
                        console.log('Parsing string:', files);
                        files = JSON.parse(files);
                      }
                      
                      console.log('Parsed files:', files);
                      
                      if (Array.isArray(files) && files.length > 0) {
                        return files.map((fileName, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <Paperclip className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 flex-1">{fileName}</span>
                            <button className="text-blue-600 hover:text-blue-800 text-xs">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ));
                      }
                      
                      return <span className="text-sm text-gray-500">Array kosong atau bukan array</span>;
                    } catch (e) {
                      console.error('Error parsing files:', e);
                      return <span className="text-sm text-gray-500">Error: {String(selectedRequest.file_attachments)}</span>;
                    }
                  })()}
                </div>
              </div>
              {selectedRequest.catatan_ppid && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Catatan PPID</label>
                  <p className="text-gray-900">{selectedRequest.catatan_ppid}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                <p className="text-gray-900">
                  {(() => {
                    try {
                      const date = new Date(selectedRequest.created_at);
                      return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID') : 'Tanggal tidak tersedia';
                    } catch {
                      return 'Tanggal tidak tersedia';
                    }
                  })()}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedRequest(null)}
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
        type="danger"
        isLoading={isProcessing}
      />
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />
      
      {/* Keberatan Withdrawal Modal */}
      <ConfirmationModal
        isOpen={showKeberatanModal}
        onClose={() => setShowKeberatanModal(false)}
        onConfirm={handleConfirmKeberatanWithdraw}
        title="Tarik Keberatan"
        message={`Apakah Anda yakin ingin menarik kembali keberatan #${selectedKeberatanId}? Tindakan ini tidak dapat dibatalkan dan keberatan akan dihapus dari sistem.`}
        confirmText="Ya, Tarik"
        isLoading={isProcessing}
      />
      
      <AccessibilityHelper />
    </div>
  );
}