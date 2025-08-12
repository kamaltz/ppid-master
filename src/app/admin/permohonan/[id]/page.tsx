"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminData } from "@/lib/api";
import { useParams } from "next/navigation";

export default function DetailPermohonanPage() {
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (token && id) {
      const fetchRequest = async () => {
        try {
          const data = await getAdminData(`/permintaan/${id}`, token);
          setRequest(data);
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
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="mb-4 text-2xl font-bold">
        Detail Permohonan: #{request.no_pendaftaran}
      </h1>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Nama Pemohon:</h3>
          <p>{request.pemohon_informasi_publik.nama}</p>
        </div>
        <div>
          <h3 className="font-semibold">Email Pemohon:</h3>
          <p>{request.pemohon_informasi_publik.email}</p>
        </div>
        <div>
          <h3 className="font-semibold">Informasi yang Diminta:</h3>
          <p className="whitespace-pre-wrap">
            {request.rincian_informasi_diminta}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Tujuan:</h3>
          <p className="whitespace-pre-wrap">
            {request.tujuan_penggunaan_informasi}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Status Saat Ini:</h3>
          <p className="text-lg font-bold text-primary">
            {request.status_permohonan}
          </p>
        </div>
        <hr className="my-6" />
        <div className="flex space-x-4">
          {/* Di sini Anda bisa menambahkan tombol Aksi */}
          <button className="px-4 py-2 font-bold text-white rounded-lg bg-accent hover:bg-green-600">
            Tugaskan ke PPID Pelaksana
          </button>
          <button className="px-4 py-2 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">
            Tolak Permohonan
          </button>
        </div>
      </div>
    </div>
  );
}
