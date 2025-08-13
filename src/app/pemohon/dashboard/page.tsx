"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, FileText, Clock, CheckCircle, AlertTriangle, X, User } from "lucide-react";
import AccessibilityHelper from "@/components/accessibility/AccessibilityHelper";
import { usePemohonData } from "@/hooks/usePemohonData";

interface PermintaanData {
  id: number;
  rincian_informasi: string;
  status: string;
  created_at: string;
  catatan_ppid?: string;
}

export default function PemohonDashboardPage() {
  const [selectedRequest, setSelectedRequest] = useState<PermintaanData | null>(null);
  const { permintaan, stats, isLoading } = usePemohonData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diajukan": return "text-yellow-600 bg-yellow-100";
      case "Diproses": return "text-blue-600 bg-blue-100";
      case "Selesai": return "text-green-600 bg-green-100";
      case "Ditolak": return "text-red-600 bg-red-100";
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
                      {request.rincian_informasi.substring(0, 50)}...
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
      </div>
      
      {/* Keberatan Section - TODO: Implement with real data */}
      <div className="bg-white rounded-lg shadow-md mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Keberatan</h2>
        </div>
        <div className="px-6 py-4 text-center text-gray-500">
          Fitur keberatan akan segera tersedia
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
      

      
      <AccessibilityHelper />
    </div>
  );
}