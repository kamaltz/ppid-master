"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Check, X, User, Clock, Mail, CheckSquare, Square } from "lucide-react";

interface PemohonData {
  id: number;
  nama: string;
  email: string;
  nik: string;
  no_telepon: string;
  alamat: string;
  pekerjaan: string;
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
                  </div>
                </div>

                <div className="flex space-x-2">
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
    </div>
  );
}