"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FileText, Calendar } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: "informasi" | "page";
  kategori?: string;
  tanggal?: string;
  url: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    
    // Get data from localStorage
    const informasiData = JSON.parse(localStorage.getItem('informasi_data') || '[]');
    
    const mockResults: SearchResult[] = [
      ...informasiData.map((item: any) => ({
        id: item.id.toString(),
        title: item.judul,
        content: item.konten.replace(/<[^>]*>/g, ''),
        type: "informasi" as const,
        kategori: item.kategori,
        tanggal: item.tanggal,
        url: `/informasi/${item.id}`
      })),
      {
        id: "profil",
        title: "Profil PPID",
        content: "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut",
        type: "page" as const,
        url: "/profil"
      },
      {
        id: "dip",
        title: "Daftar Informasi Publik (DIP)",
        content: "Katalog informasi yang wajib disediakan dan diumumkan oleh PPID Diskominfo Kabupaten Garut",
        type: "page" as const,
        url: "/dip"
      }
    ];

    // Filter results based on search query
    const filtered = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setTimeout(() => {
      setResults(filtered);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Hasil Pencarian</h1>
          </div>
          
          {query && (
            <p className="text-gray-600">
              Menampilkan hasil untuk: <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Mencari...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Ditemukan {results.length} hasil
            </p>
            
            {results.map((result) => (
              <div key={result.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {result.type === "informasi" ? "Informasi" : "Halaman"}
                    </span>
                    {result.kategori && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {result.kategori}
                      </span>
                    )}
                  </div>
                  {result.tanggal && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {result.tanggal}
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  <a href={result.url} className="hover:text-blue-600 transition-colors">
                    {result.title}
                  </a>
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {result.content.substring(0, 150)}...
                </p>
                
                <a
                  href={result.url}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Lihat selengkapnya →
                </a>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Tidak ada hasil ditemukan
            </h3>
            <p className="text-gray-500">
              Coba gunakan kata kunci yang berbeda atau lebih umum
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Masukkan kata kunci pencarian
            </h3>
            <p className="text-gray-500">
              Gunakan kolom pencarian di header untuk mencari informasi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}