"use client";

import { useEffect, useState, useCallback } from "react";
import { getPublicData } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { FileText, ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
import Link from "next/link";

interface Informasi {
  id: number;
  judul: string;
  ringkasan_isi_informasi: string;
  klasifikasi: string;
  tanggal_posting: string;
  created_at: string;
  thumbnail?: string;
  images?: string;
}

interface Category {
  id: number;
  slug: string;
  nama: string;
}

export default function InformasiPage() {
  const [informasi, setInformasi] = useState<Informasi[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getPublicData('/kategori');
      setCategories(response.data || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  }, []);

  const fetchAvailableYears = useCallback(async () => {
    try {
      const response = await getPublicData('/informasi?limit=1000');
      const years: number[] = response.data?.map((item: Informasi) => {
        const date = new Date(item.tanggal_posting || item.created_at);
        return date.getFullYear();
      }) || [];
      const uniqueYears = [...new Set(years)].sort((a: number, b: number) => b - a);
      setAvailableYears(uniqueYears);
      
      // Extract unique authors
      const authors: string[] = response.data?.map((item: any) => item.pejabat_penguasa_informasi).filter(Boolean) || [];
      const uniqueAuthors = [...new Set(authors)].sort();
      setAvailableAuthors(uniqueAuthors);
    } catch {
      console.error('Failed to fetch years and authors');
    }
  }, []);

  const fetchInformasi = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (search) params.append('search', search);
      if (selectedCategory) params.append('klasifikasi', selectedCategory);
      if (selectedYear) params.append('tahun', selectedYear);
      if (startDate) params.append('tanggalMulai', startDate);
      if (endDate) params.append('tanggalSelesai', endDate);
      if (selectedAuthor) params.append('penulis', selectedAuthor);
      
      const data = await getPublicData(`/informasi?${params}`);
      setInformasi(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch {
      setError('Gagal memuat informasi publik');
      setInformasi([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedCategory, selectedYear, startDate, endDate, selectedAuthor]);

  useEffect(() => {
    fetchCategories();
    fetchAvailableYears();
  }, [fetchCategories, fetchAvailableYears]);

  useEffect(() => {
    fetchInformasi();
  }, [fetchInformasi]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInformasi();
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedYear("");
    setStartDate("");
    setEndDate("");
    setSelectedAuthor("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Informasi Publik</h1>
          <p className="text-gray-600">Daftar lengkap informasi publik Kabupaten Garut</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value || "")}
                  placeholder="Cari informasi..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Cari
              </button>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value || "")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.nama}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value || "")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Tahun</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value || "")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value || "")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penulis</label>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value || "")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Penulis</option>
                    {availableAuthors.map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                >
                  <X className="w-4 h-4" />
                  Reset Filter
                </button>
                {(selectedCategory || selectedYear || startDate || endDate || selectedAuthor) && (
                  <div className="text-sm text-blue-600 flex items-center font-medium">
                    Filter aktif: {[selectedCategory, selectedYear, startDate && 'Tanggal Mulai', endDate && 'Tanggal Selesai', selectedAuthor && 'Penulis'].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="mt-4 text-sm text-gray-600">
            {total > 0 ? `Menampilkan ${informasi.length} dari ${total} informasi` : 'Tidak ada informasi'}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat informasi...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : informasi.length > 0 ? (
          <>
            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {informasi.map((item) => {
                const getImageUrl = () => {
                  if (item.thumbnail) return item.thumbnail;
                  if (item.images) {
                    try {
                      const parsedImages = JSON.parse(item.images);
                      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                        return parsedImages[0].url || parsedImages[0];
                      }
                    } catch {
                      // Ignore JSON parse errors
                    }
                  }
                  return null;
                };
                
                return (
                  <Link key={item.id} href={`/informasi/${item.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 overflow-hidden">
                      {/* Thumbnail */}
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        {getImageUrl() ? (
                          <img
                            src={getImageUrl()!}
                            alt={item.judul}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div class="text-gray-400 text-4xl flex items-center justify-center h-full">📄</div>';
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-4xl">📄</div>
                        )}
                      </div>
                      
                      <CardHeader className="p-4">
                        <div className="flex items-start gap-2 mb-3">
                          <div className="bg-blue-50 p-1.5 rounded-lg flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                              {item.judul}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {item.klasifikasi}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(item.tanggal_posting || item.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 bg-white rounded-lg shadow-md p-4">
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
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Tidak ada informasi yang ditemukan</p>
            <p className="text-gray-400 text-sm mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        )}
      </div>
    </div>
  );
}