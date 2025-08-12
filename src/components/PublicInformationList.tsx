"use client";

import { useEffect, useState } from "react";
import { getPublicData } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/Card"; // Asumsi komponen Card
import { FileText } from "lucide-react";

// Definisikan tipe data untuk konsistensi
interface Informasi {
  id_informasi: number;
  judul: string;
  ringkasan_isi_informasi: string;
  klasifikasi: string;
}

export default function PublicInformationList() {
  const [informasi, setInformasi] = useState<Informasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with dummy data since backend endpoint doesn't exist
    const dummyData: Informasi[] = [
      {
        id_informasi: 1,
        judul: "Laporan Keuangan Tahunan 2023",
        ringkasan_isi_informasi: "Laporan keuangan lengkap Diskominfo Kabupaten Garut tahun 2023",
        klasifikasi: "Informasi Berkala"
      },
      {
        id_informasi: 2,
        judul: "Struktur Organisasi PPID",
        ringkasan_isi_informasi: "Struktur organisasi dan tugas PPID Diskominfo Kabupaten Garut",
        klasifikasi: "Informasi Setiap Saat"
      }
    ];
    
    setTimeout(() => {
      setInformasi(dummyData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <p className="text-center">Memuat informasi...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {informasi.length > 0 ? (
        informasi.map((item) => (
          <Card key={item.id_informasi}>
            <CardHeader className="flex flex-row items-center gap-4">
              <FileText className="h-8 w-8 text-blue-800" />
              <div>
                <CardTitle>{item.judul}</CardTitle>
                <CardDescription>
                  {item.ringkasan_isi_informasi}
                </CardDescription>
                <span className="text-xs font-semibold mt-2 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {item.klasifikasi}
                </span>
              </div>
            </CardHeader>
          </Card>
        ))
      ) : (
        <p className="text-center">
          Tidak ada informasi yang tersedia saat ini.
        </p>
      )}
    </div>
  );
}
