"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Download, Paperclip } from "lucide-react";
import RequestChat from "@/components/RequestChat";
import RoleGuard from "@/components/auth/RoleGuard";
import { ROLES } from "@/lib/roleUtils";

interface PermohonanRequest {
  id: string;
  rincian_informasi: string;
  tujuan_penggunaan: string;
  cara_memperoleh_informasi: string;
  cara_mendapat_salinan: string;
  status: string;
  created_at: string;
  file_attachments: string | string[];
  catatan_ppid?: string;
  pemohon?: {
    nama: string;
    email: string;
    nik: string;
    no_telepon: string;
    alamat: string;
  };
}

export default function DetailPermohonanPage() {
  const [request, setRequest] = useState<PermohonanRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { token, getUserRole } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const userRole = getUserRole();

  const updateStatus = async (newStatus: string, catatan?: string) => {
    if (!token) return;
    
    setUpdating(true);
    try {
      console.log('Updating status:', { newStatus, catatan });
      const response = await fetch(`/api/permintaan/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, catatan_ppid: catatan })
      });
      
      if (response.ok) {
        alert('Status berhasil diperbarui');
        // Refresh data
        const result = await response.json();
        setRequest(result.data);
        // Refresh the page to update chat
        window.location.reload();
      } else {
        alert('Gagal memperbarui status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      const fetchRequest = async () => {
        try {
          const response = await fetch(`/api/permintaan/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const result = await response.json();
          setRequest(result.data);
        } catch (error) {
          console.error("Gagal mengambil detail permohonan:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [token, id]);

  if (loading) return <div>Loading detail permohonan...</div>;
  if (!request) return <div>Data permohonan tidak ditemukan.</div>;

  return (
    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]}>
      <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="mb-4 text-2xl font-bold">
        Detail Permohonan: #{request.id}
      </h1>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">ID Permohonan:</h3>
          <p>{request.id}</p>
        </div>
        <div>
          <h3 className="font-semibold">Nama Pemohon:</h3>
          <p>{request.pemohon?.nama || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Email:</h3>
          <p>{request.pemohon?.email || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">NIK:</h3>
          <p>{request.pemohon?.nik || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">No. Telepon:</h3>
          <p>{request.pemohon?.no_telepon || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Alamat:</h3>
          <p>{request.pemohon?.alamat || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Informasi Diminta:</h3>
          <p className="whitespace-pre-wrap">
            {request.rincian_informasi}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Tujuan Penggunaan:</h3>
          <p className="whitespace-pre-wrap">
            {request.tujuan_penggunaan}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Cara Memperoleh Informasi:</h3>
          <p>{request.cara_memperoleh_informasi}</p>
        </div>
        <div>
          <h3 className="font-semibold">Cara Mendapat Salinan:</h3>
          <p>{request.cara_mendapat_salinan}</p>
        </div>
        <div>
          <h3 className="font-semibold">Status:</h3>
          <p className="text-lg font-bold text-blue-600">
            {request.status}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Tanggal Pengajuan:</h3>
          <p>{new Date(request.created_at).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric', 
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>
        <div>
          <h3 className="font-semibold">File Lampiran:</h3>
          <div className="bg-gray-50 p-3 rounded-lg">
            {(() => {
              console.log('File attachments raw:', request.file_attachments);
              
              if (!request.file_attachments) {
                return <span className="text-sm text-gray-500">Tidak ada file lampiran</span>;
              }
              
              try {
                let files = request.file_attachments;
                if (typeof files === 'string') {
                  files = JSON.parse(files);
                }
                
                if (Array.isArray(files) && files.length > 0) {
                  return files.map((fileName, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border mb-2">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{fileName}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ));
                }
                
                return <span className="text-sm text-gray-500">Tidak ada file lampiran</span>;
              } catch (e) {
                console.error('Error parsing files:', e);
                return <span className="text-sm text-gray-500">Raw data: {String(request.file_attachments)}</span>;
              }
            })()} 
          </div>
        </div>
        {request.catatan_ppid && (
          <div>
            <h3 className="font-semibold">Catatan PPID:</h3>
            <p className="whitespace-pre-wrap">{request.catatan_ppid}</p>
          </div>
        )}
        <hr className="my-6" />
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => updateStatus('Diproses')}
            disabled={updating || request.status === 'Diproses'}
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {updating ? 'Memproses...' : 'Proses Permohonan'}
          </button>
          <button 
            onClick={() => updateStatus('Selesai')}
            disabled={updating || request.status === 'Selesai'}
            className="px-4 py-2 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {updating ? 'Memproses...' : 'Selesaikan'}
          </button>
          <button 
            onClick={() => {
              console.log('Tolak button clicked!');
              setShowRejectModal(true);
            }}
            disabled={updating || request.status === 'Ditolak'}
            className="px-4 py-2 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
          >
            {updating ? 'Memproses...' : 'Tolak Permohonan'}
          </button>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Kembali
          </button>
        </div>
        
        <hr className="my-6" />
        
        <RequestChat requestId={parseInt(request.id)} currentUserRole={userRole || "PPID"} isAdmin={userRole === 'ADMIN' || userRole === 'PPID_UTAMA'} />
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Tolak Permohonan</h3>
            <p className="text-sm text-gray-600 mb-4">
              Berikan alasan penolakan yang akan dikirim ke pemohon:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 h-32 mb-4"
              placeholder="Masukkan alasan penolakan..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (rejectReason.trim()) {
                    console.log('Rejecting with reason:', rejectReason);
                    updateStatus('Ditolak', rejectReason.trim());
                    setShowRejectModal(false);
                    setRejectReason('');
                  } else {
                    alert('Alasan penolakan wajib diisi');
                  }
                }}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}
