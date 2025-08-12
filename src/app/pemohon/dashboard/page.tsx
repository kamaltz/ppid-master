"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, FileText, Clock, CheckCircle, AlertTriangle, X, User } from "lucide-react";
import AccessibilityHelper from "@/components/accessibility/AccessibilityHelper";

interface Request {
  id: string;
  informasi: string;
  status: string;
  tanggal: string;
}

interface Keberatan {
  id: string;
  permohonan_asal: string;
  alasan_keberatan: string;
  status: string;
  tahap: string;
  tanggal: string;
}

export default function PemohonDashboardPage() {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedKeberatan, setSelectedKeberatan] = useState<Keberatan | null>(null);
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
    }
  ]);
  
  const [keberatan] = useState<Keberatan[]>([
    {
      id: "KBR001",
      permohonan_asal: "REQ001",
      alasan_keberatan: "Informasi yang diberikan tidak lengkap",
      status: "Diproses",
      tahap: "PPID Utama",
      tanggal: "2024-01-15"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu": return "text-yellow-600 bg-yellow-100";
      case "Diproses": return "text-blue-600 bg-blue-100";
      case "Selesai": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
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
  
  const handleWithdrawRequest = (id: string) => {
    if (confirm(`Yakin ingin menarik kembali permohonan ${id}? Tindakan ini tidak dapat dibatalkan.`)) {
      alert(`Permohonan ${id} berhasil ditarik kembali`);
    }
  };
  
  const handleWithdrawKeberatan = (id: string) => {
    if (confirm(`Yakin ingin menarik kembali keberatan ${id}? Tindakan ini tidak dapat dibatalkan.`)) {
      alert(`Keberatan ${id} berhasil ditarik kembali`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Pemohon</h1>
          <p className="text-sm text-gray-600 mt-1">Login sebagai: <span className="font-semibold text-blue-600">Pemohon</span></p>
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
          <Link href="/pemohon/keberatan/riwayat">
            <button className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg">
              <FileText className="mr-2 w-5 h-5" />
              Riwayat Keberatan
            </button>
          </Link>
          <Link href="/pemohon/permohonan">
            <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg">
              <FileText className="mr-2 w-5 h-5" />
              Riwayat Permohonan
            </button>
          </Link>
          <Link href="/pemohon/profile">
            <button className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg">
              <User className="mr-2 w-5 h-5" />
              Profile
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
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Diproses</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === "Diproses").length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === "Selesai").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Permohonan</h2>
        </div>
        <div className="overflow-x-auto">
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
      </div>
      
      {/* Keberatan Section */}
      <div className="bg-white rounded-lg shadow-md mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Keberatan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permohonan Asal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {keberatan.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.permohonan_asal}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTahapColor(item.tahap)}`}>
                      {item.tahap}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.tanggal}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button 
                      onClick={() => setSelectedKeberatan(item)}
                      className="text-blue-600 hover:text-blue-900 text-xs"
                    >
                      Detail
                    </button>
                    {(item.status === 'Diproses' || item.status === 'Diteruskan') && (
                      <button 
                        onClick={() => handleWithdrawKeberatan(item.id)}
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
      
      {/* Detail Keberatan Modal */}
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
                <p className="text-gray-900">{selectedKeberatan.permohonan_asal}</p>
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
                <label className="text-sm font-medium text-gray-600">Tahap</label>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTahapColor(selectedKeberatan.tahap)}`}>
                  {selectedKeberatan.tahap}
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
      
      <AccessibilityHelper />
    </div>
  );
}