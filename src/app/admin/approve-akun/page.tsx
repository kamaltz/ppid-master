"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Check, X, User, Clock, Mail, Phone, MapPin, Briefcase } from "lucide-react";

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
        <div className="space-y-6">
          {pemohonList.map((pemohon) => (
            <div key={pemohon.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <User className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {pemohon.nama}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Mendaftar: {new Date(pemohon.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{pemohon.email || 'Email tidak tersedia'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{pemohon.no_telepon || 'Telepon tidak tersedia'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{pemohon.alamat || 'Alamat tidak tersedia'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{pemohon.pekerjaan || 'Pekerjaan tidak tersedia'}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-600">
                      <strong>NIK:</strong> {pemohon.nik || 'NIK tidak tersedia'}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 ml-6">
                  <button
                    onClick={() => handleApprove(pemohon.id)}
                    disabled={processing === pemohon.id}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {processing === pemohon.id ? "Memproses..." : "Setujui"}
                  </button>
                  <button
                    onClick={() => handleReject(pemohon.id)}
                    disabled={processing === pemohon.id}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
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