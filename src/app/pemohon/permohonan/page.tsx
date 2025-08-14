"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { usePemohonData } from "@/hooks/usePemohonData";

interface Request {
  id: number;
  judul?: string;
  rincian_informasi: string;
  status: string;
  created_at: string;
  tujuan_penggunaan?: string;
  cara_memperoleh_informasi?: string;
  cara_mendapat_salinan?: string;
  catatan_ppid?: string;
}

export default function RiwayatPermohonanPage() {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { permintaan, isLoading } = usePemohonData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu": return "text-yellow-600 bg-yellow-100";
      case "Diproses": return "text-blue-600 bg-blue-100";
      case "Selesai": return "text-green-600 bg-green-100";
      case "Ditolak": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const handleWithdrawRequest = (id: string) => {
    if (confirm(`Yakin ingin menarik kembali permohonan ${id}? Tindakan ini tidak dapat dibatalkan.`)) {
      alert(`Permohonan ${id} berhasil ditarik kembali`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Riwayat Permohonan</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    {request.judul || request.rincian_informasi.substring(0, 50) + '...'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(() => {
                      try {
                        const date = new Date(request.created_at);
                        return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID') : 'Tanggal tidak tersedia';
                      } catch (e) {
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
                      <button 
                        onClick={() => handleWithdrawRequest(request.id.toString())}
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
                <label className="text-sm font-medium text-gray-600">Judul</label>
                <p className="text-gray-900">{selectedRequest.judul || 'Tidak ada judul'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Rincian Informasi</label>
                <p className="text-gray-900">{selectedRequest.rincian_informasi}</p>
              </div>
              {selectedRequest.tujuan_penggunaan && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tujuan Penggunaan</label>
                  <p className="text-gray-900">{selectedRequest.tujuan_penggunaan}</p>
                </div>
              )}
              {selectedRequest.cara_memperoleh_informasi && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Cara Memperoleh Informasi</label>
                  <p className="text-gray-900">{selectedRequest.cara_memperoleh_informasi}</p>
                </div>
              )}
              {selectedRequest.cara_mendapat_salinan && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Cara Mendapat Salinan</label>
                  <p className="text-gray-900">{selectedRequest.cara_mendapat_salinan}</p>
                </div>
              )}
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
                    } catch (e) {
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
    </div>
  );
}