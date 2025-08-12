"use client";

import { useState } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { X } from "lucide-react";

interface Keberatan {
  id: number;
  nama: string;
  email: string;
  permohonan_asal: string;
  alasan_keberatan: string;
  status: string;
  tahap: string;
  tanggal: string;
}

export default function AdminKeberatanPage() {
  const { userRole } = useRoleAccess();
  const [selectedKeberatan, setSelectedKeberatan] = useState<Keberatan | null>(null);
  const [keberatan, setKeberatan] = useState<Keberatan[]>([
    {
      id: 1,
      nama: "Ahmad Rizki",
      email: "ahmad@email.com",
      permohonan_asal: "REQ001",
      alasan_keberatan: "Informasi yang diberikan tidak lengkap",
      status: "Diproses",
      tahap: "PPID Utama",
      tanggal: "2024-01-15"
    },
    {
      id: 2,
      nama: "Siti Nurhaliza",
      email: "siti@email.com",
      permohonan_asal: "REQ002",
      alasan_keberatan: "Permintaan informasi ditolak tanpa alasan jelas",
      status: "Diteruskan",
      tahap: "PPID Pelaksana",
      tanggal: "2024-01-14"
    }
  ]);

  const updateStatus = (id: number, newStatus: string, newTahap: string) => {
    const currentKeberatan = keberatan.find(k => k.id === id);
    if (!currentKeberatan) return;
    
    let confirmMessage = '';
    let successMessage = '';
    
    if (currentKeberatan.tahap === 'PPID Utama' && newStatus === 'Diteruskan') {
      confirmMessage = `Yakin ingin meneruskan keberatan KBR${String(id).padStart(3, '0')} ke PPID Pelaksana?`;
      successMessage = `Keberatan KBR${String(id).padStart(3, '0')} diteruskan ke PPID Pelaksana`;
    } else if (currentKeberatan.tahap === 'PPID Pelaksana' && newStatus === 'Selesai') {
      confirmMessage = `Yakin ingin menyelesaikan keberatan KBR${String(id).padStart(3, '0')}?`;
      successMessage = `Keberatan KBR${String(id).padStart(3, '0')} berhasil diselesaikan`;
    } else if (currentKeberatan.tahap === 'PPID Pelaksana' && newStatus === 'Ditolak') {
      confirmMessage = `Yakin ingin menolak keberatan KBR${String(id).padStart(3, '0')}? Tindakan ini tidak dapat dibatalkan.`;
      successMessage = `Keberatan KBR${String(id).padStart(3, '0')} ditolak`;
    }
    
    if (confirmMessage && confirm(confirmMessage)) {
      setKeberatan(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus, tahap: newTahap } : item
      ));
      alert(successMessage);
    }
  };

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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Kelola Keberatan</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permohonan Asal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {keberatan.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.permohonan_asal}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.alasan_keberatan}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTahapColor(item.tahap)}`}>
                    {item.tahap}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tanggal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                    {item.status === 'Diproses' && item.tahap === 'PPID Utama' && (
                      <button 
                        onClick={() => updateStatus(item.id, 'Diteruskan', 'PPID Pelaksana')}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Teruskan
                      </button>
                    )}
                    {item.status === 'Diteruskan' && item.tahap === 'PPID Pelaksana' && (
                      <>
                        <button 
                          onClick={() => updateStatus(item.id, 'Selesai', 'Selesai')}
                          className="text-green-600 hover:text-green-900 text-xs"
                        >
                          Selesai
                        </button>
                        <button 
                          onClick={() => updateStatus(item.id, 'Ditolak', 'Selesai')}
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
                  <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
                    <button 
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus keberatan KBR${String(item.id).padStart(3, '0')} dari "${item.nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
                          setKeberatan(prev => prev.filter(k => k.id !== item.id));
                          alert(`Keberatan KBR${String(item.id).padStart(3, '0')} berhasil dihapus`);
                        }
                      }}
                      className="text-red-600 hover:text-red-900 text-xs"
                    >
                      Hapus
                    </button>
                  </RoleGuard>
                </td>
              </tr>
            ))}
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
                <p className="text-gray-900">KBR{String(selectedKeberatan.id).padStart(3, '0')}</p>
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
    </div>
  );
}