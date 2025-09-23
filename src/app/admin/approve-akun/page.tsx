"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Check, X, User, Clock, Mail, CheckSquare, Square, Eye, Phone, MapPin, Briefcase, Calendar, CreditCard } from "lucide-react";

interface PemohonData {
  id: number;
  nama: string;
  email: string;
  nik: string;
  no_telepon: string;
  alamat: string;
  pekerjaan: string;
  ktp_image: string;
  is_approved: boolean;
  created_at: string;
}

export default function ApproveAkunPage() {
  const { getToken } = useAuth();
  const [pemohonList, setPemohonList] = useState<PemohonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [selectedPemohon, setSelectedPemohon] = useState<PemohonData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchPemohon = async () => {
    try {
      const token = getToken();
      const response = await fetch("/api/accounts/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPemohonList(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pemohon:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pemohonId: number) => {
    setProcessing(pemohonId);
    try {
      const token = getToken();
      const response = await fetch("/api/accounts/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pemohonId }),
      });

      const data = await response.json();
      if (data.success) {
        setPemohonList(prev => prev.filter(p => p.id !== pemohonId));
      } else {
        alert("Gagal approve akun: " + data.error);
      }
    } catch (error) {
      console.error("Error approving account:", error);
      alert("Terjadi kesalahan saat approve akun");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (pemohonId: number) => {
    if (!confirm("Yakin ingin menolak akun ini?")) return;
    
    setProcessing(pemohonId);
    try {
      const token = getToken();
      const response = await fetch(`/api/accounts/${pemohonId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPemohonList(prev => prev.filter(p => p.id !== pemohonId));
      } else {
        alert("Gagal menolak akun: " + data.error);
      }
    } catch (error) {
      console.error("Error rejecting account:", error);
      alert("Terjadi kesalahan saat menolak akun");
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Yakin ingin menyetujui ${selectedIds.length} akun?`)) return;
    
    setBulkProcessing(true);
    try {
      const token = getToken();
      const response = await fetch("/api/accounts/bulk-approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pemohonIds: selectedIds }),
      });

      const data = await response.json();
      if (data.success) {
        setPemohonList(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } else {
        alert("Gagal approve akun: " + data.error);
      }
    } catch (error) {
      console.error("Error bulk approving accounts:", error);
      alert("Terjadi kesalahan saat approve akun");
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Yakin ingin menolak ${selectedIds.length} akun?`)) return;
    
    setBulkProcessing(true);
    try {
      const token = getToken();
      const response = await fetch("/api/accounts/bulk-reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pemohonIds: selectedIds }),
      });

      const data = await response.json();
      if (data.success) {
        setPemohonList(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } else {
        alert("Gagal menolak akun: " + data.error);
      }
    } catch (error) {
      console.error("Error bulk rejecting accounts:", error);
      alert("Terjadi kesalahan saat menolak akun");
    } finally {
      setBulkProcessing(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === pemohonList.length ? [] : pemohonList.map(p => p.id)
    );
  };

  const showDetail = (pemohon: PemohonData) => {
    setSelectedPemohon(pemohon);
    setShowDetailModal(true);
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setTimeout(() => {
      setSelectedPemohon(null);
    }, 100);
  };

  useEffect(() => {
    fetchPemohon();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Approve Akun Pemohon
        </h1>
        <p className="text-gray-600">
          Kelola persetujuan akun pemohon yang mendaftar
        </p>
        
        {pemohonList.length > 0 && (
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={toggleSelectAll}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              {selectedIds.length === pemohonList.length ? 
                <CheckSquare className="w-4 h-4 mr-1" /> : 
                <Square className="w-4 h-4 mr-1" />
              }
              Pilih Semua ({selectedIds.length})
            </button>
            
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkProcessing}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  Setujui ({selectedIds.length})
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={bulkProcessing}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Tolak ({selectedIds.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {pemohonList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada akun pending
          </h3>
          <p className="text-gray-500">
            Semua akun pemohon sudah disetujui atau belum ada yang mendaftar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pemohonList.map((pemohon) => (
            <div key={pemohon.id} className={`bg-white rounded-lg shadow-md p-4 border-2 transition-colors ${
              selectedIds.includes(pemohon.id) ? 'border-blue-300 bg-blue-50' : 'border-transparent'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleSelect(pemohon.id)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    {selectedIds.includes(pemohon.id) ? 
                      <CheckSquare className="w-5 h-5 text-blue-600" /> : 
                      <Square className="w-5 h-5" />
                    }
                  </button>
                  
                  <User className="w-6 h-6 text-blue-600" />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{pemohon.nama}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {pemohon.email}
                      </span>
                      <span>NIK: {pemohon.nik}</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(pemohon.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    {pemohon.no_telepon && (
                      <div className="text-sm text-gray-600 mt-1">
                        Telepon: {pemohon.no_telepon}
                      </div>
                    )}
                    {pemohon.pekerjaan && (
                      <div className="text-sm text-gray-600 mt-1">
                        Pekerjaan: {pemohon.pekerjaan}
                      </div>
                    )}
                    {pemohon.alamat && (
                      <div className="text-sm text-gray-600 mt-1">
                        Alamat: {pemohon.alamat}
                      </div>
                    )}
                  </div>
                  
                  {pemohon.ktp_image && (
                    <div className="ml-4">
                      <img
                        src={pemohon.ktp_image.startsWith('http') ? pemohon.ktp_image : pemohon.ktp_image}
                        alt="KTP"
                        className="w-32 h-20 object-cover rounded border border-gray-300"
                        onClick={() => window.open(pemohon.ktp_image, '_blank')}
                        style={{ cursor: 'pointer' }}
                        title="Klik untuk memperbesar"
                        onError={(e) => {
                          console.error('Image load error:', pemohon.ktp_image);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">Foto KTP</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => showDetail(pemohon)}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detail
                  </button>
                  <button
                    onClick={() => handleApprove(pemohon.id)}
                    disabled={processing === pemohon.id}
                    className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {processing === pemohon.id ? "..." : "Setujui"}
                  </button>
                  <button
                    onClick={() => handleReject(pemohon.id)}
                    disabled={processing === pemohon.id}
                    className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Detail Modal */}
      <div style={{display: showDetailModal && selectedPemohon ? 'block' : 'none'}}>
        {showDetailModal && selectedPemohon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detail Pemohon</h2>
              <button
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informasi Personal</h3>
                    
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Nama Lengkap</p>
                        <p className="font-medium text-gray-900">{selectedPemohon.nama}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">NIK</p>
                        <p className="font-medium text-gray-900">{selectedPemohon.nik}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedPemohon.email}</p>
                      </div>
                    </div>
                    
                    {selectedPemohon.no_telepon && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">No. Telepon</p>
                          <p className="font-medium text-gray-900">{selectedPemohon.no_telepon}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedPemohon.pekerjaan && (
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Pekerjaan</p>
                          <p className="font-medium text-gray-900">{selectedPemohon.pekerjaan}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Daftar</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedPemohon.created_at).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* KTP Image */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Foto KTP</h3>
                    {selectedPemohon.ktp_image ? (
                      <div className="space-y-3">
                        <img
                          src={selectedPemohon.ktp_image}
                          alt="KTP"
                          className="w-full h-auto rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => window.open(selectedPemohon.ktp_image, '_blank')}
                          onError={(e) => {
                            console.error('Image load error:', selectedPemohon.ktp_image);
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMyMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxNjAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3Mjg0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HYW1iYXIgS1RQIHR0aWRhayBkYXBhdCBkaW11YXQ8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <p className="text-xs text-gray-500 text-center">
                          Klik gambar untuk memperbesar
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Tidak ada foto KTP</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Address */}
                {selectedPemohon.alamat && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Alamat</h3>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Alamat Lengkap</p>
                        <p className="font-medium text-gray-900 leading-relaxed">{selectedPemohon.alamat}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeDetail}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleReject(selectedPemohon.id);
                  closeDetail();
                }}
                disabled={processing === selectedPemohon.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <X className="w-4 h-4 inline mr-1" />
                Tolak
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedPemohon.id);
                  closeDetail();
                }}
                disabled={processing === selectedPemohon.id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Check className="w-4 h-4 inline mr-1" />
                {processing === selectedPemohon.id ? 'Memproses...' : 'Setujui'}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}