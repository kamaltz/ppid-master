"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import KeberatanChat from "@/components/KeberatanChat";

interface KeberatanDetail {
  id: string;
  alasan_keberatan: string;
  status: string;
  created_at: string;
  permintaan_id: number;
  pemohon?: {
    nama: string;
    email: string;
    nik: string;
    no_telepon: string;
    alamat: string;
  };
}

export default function DetailKeberatanPage() {
  const [keberatan, setKeberatan] = useState<KeberatanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (token && id) {
      const fetchKeberatan = async () => {
        try {
          const response = await fetch(`/api/keberatan/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const result = await response.json();
          setKeberatan(result.data);
        } catch (error) {
          console.error("Gagal mengambil detail keberatan:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchKeberatan();
    }
  }, [token, id]);

  if (loading) return <div>Loading detail keberatan...</div>;
  if (!keberatan) return <div>Data keberatan tidak ditemukan.</div>;

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-red-600">
        Detail Keberatan: #{keberatan.id}
      </h1>
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="font-semibold">ID Keberatan:</h3>
          <p>{keberatan.id}</p>
        </div>
        <div>
          <h3 className="font-semibold">Nama Pemohon:</h3>
          <p>{keberatan.pemohon?.nama || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Email:</h3>
          <p>{keberatan.pemohon?.email || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Alasan Keberatan:</h3>
          <p className="whitespace-pre-wrap">{keberatan.alasan_keberatan}</p>
        </div>
        <div>
          <h3 className="font-semibold">Status:</h3>
          <p className="text-lg font-bold text-red-600">{keberatan.status}</p>
        </div>
        <div>
          <h3 className="font-semibold">Tanggal Pengajuan:</h3>
          <p>{new Date(keberatan.created_at).toLocaleDateString('id-ID')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Kembali
          </button>
        </div>
      </div>
      
      <hr className="my-6" />
      
      <KeberatanChat keberatanId={parseInt(keberatan.id)} currentUserRole="PPID" isAdmin={true} />
    </div>
  );
}