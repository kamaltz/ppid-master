"use client";

import { useEffect, useState } from "react";
import { getPublicData } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/Card"; // Asumsi komponen Card
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// Definisikan tipe data untuk konsistensi
interface Informasi {
  id: number;
  judul: string;
  ringkasan_isi_informasi: string;
  klasifikasi: string;
}

export default function PublicInformationList() {
  const [informasi, setInformasi] = useState<Informasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchInformasi();
  }, [currentPage]);

  const fetchInformasi = async () => {
    try {
      setLoading(true);
      const data = await getPublicData(`/informasi?page=${currentPage}&limit=10`);
      setInformasi(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      setError('Gagal memuat informasi publik');
      setInformasi([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <p className="text-center">Memuat informasi...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Informasi Terbaru</h3>
        <p className="text-sm text-gray-600">
          {total > 0 ? `Menampilkan ${informasi.length} dari ${total} informasi` : 'Tidak ada informasi'}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat informasi...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : informasi.length > 0 ? (
        <>
          <div className="space-y-4 mb-6">
            {informasi.map((item) => (
              <Link key={item.id} href={`/informasi/${item.id}`}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="hover:text-blue-600 transition-colors mb-2 text-lg leading-tight">
                        {item.judul}
                      </CardTitle>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                          {item.klasifikasi}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(item.tanggal_posting || item.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Sebelumnya
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Tidak ada informasi yang tersedia saat ini</p>
          <p className="text-gray-400 text-sm mt-1">Silakan periksa kembali nanti</p>
        </div>
      )}
    </div>
  );
}
