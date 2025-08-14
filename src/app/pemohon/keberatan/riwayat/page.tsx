"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Keberatan {
  id: number;
  permintaan_id: number;
  judul?: string;
  alasan_keberatan: string;
  status: string;
  created_at: string;
  catatan_ppid?: string;
  permintaan?: {
    id: number;
    rincian_informasi: string;
  };
}

export default function RiwayatKeberatanPage() {
  const [selectedKeberatan, setSelectedKeberatan] = useState<Keberatan | null>(null);
  const [keberatan, setKeberatan] = useState<Keberatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKeberatan = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
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
        setIsLoading(false);
      }
    };

    fetchKeberatan();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diproses': return 'bg-blue-100 text-blue-800';
      case 'Diteruskan': return 'bg-yellow-100 text-yellow-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Ditolak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTahapColor = (tahap: string) => {
    switch (tahap) {
      case 'PPID Utama': return 'bg-purple-100 text-purple-800';
      case 'PPID Pelaksana': return 'bg-orange-100 text-orange-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Riwayat Keberatan</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permohonan Asal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahap</th>
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
            ) : keberatan.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Belum ada keberatan
                </td>
              </tr>
            ) : (
              keberatan.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.permintaan_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {item.judul || item.alasan_keberatan.substring(0, 50) + '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTahapColor('PPID Utama')}`}>
                      PPID Utama
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(() => {
                      try {
                        const date = new Date(item.created_at);
                        return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID') : 'Tanggal tidak tersedia';
                      } catch (e) {
                        return 'Tanggal tidak tersedia';
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => setSelectedKeberatan(item)}
                      className="text-blue-600 hover:text-blue-900 text-xs"
                    >
                      Detail
                    </button>
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
                <label className="text-sm font-medium text-gray-600">Permohonan Asal</label>
                <p className="text-gray-900">#{selectedKeberatan.permintaan_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Judul Keberatan</label>
                <p className="text-gray-900">{selectedKeberatan.judul || 'Tidak ada judul'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Alasan Keberatan</label>
                <p className="text-gray-900">{selectedKeberatan.alasan_keberatan}</p>
              </div>
              {selectedKeberatan.catatan_ppid && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Catatan PPID</label>
                  <p className="text-gray-900">{selectedKeberatan.catatan_ppid}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedKeberatan.status)}`}>
                  {selectedKeberatan.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tahap</label>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTahapColor('PPID Utama')}`}>
                  PPID Utama
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                <p className="text-gray-900">
                  {(() => {
                    try {
                      const date = new Date(selectedKeberatan.created_at);
                      return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID') : 'Tanggal tidak tersedia';
                    } catch (e) {
                      return 'Tanggal tidak tersedia';
                    }
                  })()}
                </p>
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
    </div>
  );
}