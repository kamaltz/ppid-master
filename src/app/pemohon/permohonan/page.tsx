"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Request {
  id: string;
  informasi: string;
  status: string;
  tanggal: string;
}

export default function RiwayatPermohonanPage() {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [requests] = useState<Request[]>([
    {
      id: "REQ001",
      informasi: "Laporan Keuangan 2023",
      status: "Diproses",
      tanggal: "2024-01-15"
    },
    {
      id: "REQ002", 
      informasi: "Struktur Organisasi",
      status: "Selesai",
      tanggal: "2024-01-10"
    },
    {
      id: "REQ003",
      informasi: "Data Statistik Daerah",
      status: "Menunggu",
      tanggal: "2024-01-12"
    }
  ]);

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Informasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{request.informasi}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{request.tanggal}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button 
                    onClick={() => setSelectedRequest(request)}
                    className="text-blue-600 hover:text-blue-900 text-xs"
                  >
                    Detail
                  </button>
                  {(request.status === 'Diproses' || request.status === 'Menunggu') && (
                    <button 
                      onClick={() => handleWithdrawRequest(request.id)}
                      className="text-red-600 hover:text-red-900 text-xs"
                    >
                      Tarik
                    </button>
                  )}
                </td>
              </tr>
            ))}
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
                <label className="text-sm font-medium text-gray-600">Informasi Diminta</label>
                <p className="text-gray-900">{selectedRequest.informasi}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                <p className="text-gray-900">{selectedRequest.tanggal}</p>
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