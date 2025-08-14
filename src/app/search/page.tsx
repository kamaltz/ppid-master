"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FileText, Calendar, Filter } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: "informasi" | "page";
  kategori?: string;
  tanggal?: string;
  url: string;
}

interface FilterState {
  kategori: string;
  startDate: string;
  endDate: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    kategori: '',
    startDate: '',
    endDate: ''
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/informasi');
      const data = await response.json();
      if (data.success) {
        const uniqueCategories = [...new Set(data.data.map((item: any) => item.kategori).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    
    try {
      // Fetch informasi data from API
      const response = await fetch('/api/informasi');
      const data = await response.json();
      
      let informasiData = data.success ? data.data : [];
      
      // Apply filters
      if (filters.kategori) {
        informasiData = informasiData.filter((item: any) => item.kategori === filters.kategori);
      }
      
      if (filters.startDate) {
        informasiData = informasiData.filter((item: any) => {
          const itemDate = new Date(item.tanggal || item.created_at);
          return itemDate >= new Date(filters.startDate);
        });
      }
      
      if (filters.endDate) {
        informasiData = informasiData.filter((item: any) => {
          const itemDate = new Date(item.tanggal || item.created_at);
          return itemDate <= new Date(filters.endDate);
        });
      }
      
      const searchResults: SearchResult[] = [
        ...informasiData.map((item: any) => ({
          id: item.id.toString(),
          title: item.judul,
          content: item.konten ? item.konten.replace(/<[^>]*>/g, '') : item.deskripsi || '',
          type: "informasi" as const,
          kategori: item.kategori,
          tanggal: item.tanggal || new Date(item.created_at).toLocaleDateString('id-ID'),
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
      const filtered = searchResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ kategori: '', startDate: '', endDate: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Hasil Pencarian</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          
          {query && (
            <p className="text-gray-600">
              Menampilkan hasil untuk: <span className="font-semibold">"{query}"</span>
            </p>
          )}
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
              <h3 className="text-lg font-semibold mb-4">Filter Pencarian</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={filters.kategori}
                    onChange={(e) => handleFilterChange('kategori', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 mr-2"
                >
                  Reset Filter
                </button>
              </div>
            </div>
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