"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
  thumbnail?: string;
  images?: string;
}

interface FilterState {
  kategori: string;
  startDate: string;
  endDate: string;
}

interface InformasiItem {
  id: number;
  judul: string;
  klasifikasi: string;
  ringkasan_isi_informasi?: string;
  pejabat_penguasa_informasi?: string;
  tanggal_posting?: string;
  created_at: string;
  file_attachments?: string | unknown[];
  links?: string | unknown[];
  thumbnail?: string;
  images?: string;
}

function SearchPageContent() {
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

  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    
    try {
      // Fetch informasi data from API
      const response = await fetch('/api/informasi');
      const data = await response.json();
      
      let informasiData = data.data || [];
      
      // Apply filters
      if (filters.kategori) {
        informasiData = informasiData.filter((item: InformasiItem) => item.klasifikasi === filters.kategori);
      }
      
      if (filters.startDate) {
        informasiData = informasiData.filter((item: InformasiItem) => {
          const itemDate = new Date(item.tanggal_posting || item.created_at);
          return itemDate >= new Date(filters.startDate);
        });
      }
      
      if (filters.endDate) {
        informasiData = informasiData.filter((item: InformasiItem) => {
          const itemDate = new Date(item.tanggal_posting || item.created_at);
          return itemDate <= new Date(filters.endDate);
        });
      }
      
      const searchResults: SearchResult[] = [
        ...informasiData.map((item: InformasiItem) => {
          // Combine multiple content fields for better search coverage
          const combinedContent = [
            item.ringkasan_isi_informasi || '',
            item.pejabat_penguasa_informasi || '',
            // Include file names in searchable content
            (() => {
              try {
                const files = typeof item.file_attachments === 'string' 
                  ? JSON.parse(item.file_attachments) 
                  : item.file_attachments;
                return Array.isArray(files) ? files.map(f => f.name || f).join(' ') : '';
              } catch {
                return '';
              }
            })(),
            // Include links in searchable content
            (() => {
              try {
                const links = typeof item.links === 'string' 
                  ? JSON.parse(item.links) 
                  : item.links;
                return Array.isArray(links) ? links.map(l => `${l.title} ${l.url}`).join(' ') : '';
              } catch {
                return '';
              }
            })()
          ].filter(Boolean).join(' ');
          
          return {
            id: item.id.toString(),
            title: item.judul,
            content: combinedContent,
            type: "informasi" as const,
            kategori: item.klasifikasi,
            tanggal: item.tanggal_posting ? new Date(item.tanggal_posting).toLocaleDateString('id-ID') : new Date(item.created_at).toLocaleDateString('id-ID'),
            url: `/informasi/${item.id}`,
            thumbnail: item.thumbnail,
            images: item.images
          };
        }),
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

      // Enhanced search - include more fields and better matching
      const filtered = searchResults.filter(result => {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = result.title.toLowerCase().includes(searchLower);
        const contentMatch = result.content.toLowerCase().includes(searchLower);
        const categoryMatch = result.kategori?.toLowerCase().includes(searchLower) || false;
        
        // For informasi items, also search in additional fields
        if (result.type === 'informasi') {
          const originalItem = informasiData.find((item: InformasiItem) => item.id.toString() === result.id);
          if (originalItem) {
            const ringkasanMatch = originalItem.ringkasan_isi_informasi?.toLowerCase().includes(searchLower) || false;
            const pejabatMatch = originalItem.pejabat_penguasa_informasi?.toLowerCase().includes(searchLower) || false;
            const fileMatch = (() => {
              try {
                const files = typeof originalItem.file_attachments === 'string' 
                  ? JSON.parse(originalItem.file_attachments) 
                  : originalItem.file_attachments;
                return Array.isArray(files) && files.some(file => 
                  (file.name || file).toLowerCase().includes(searchLower)
                );
              } catch {
                return false;
              }
            })();
            const linkMatch = (() => {
              try {
                const links = typeof originalItem.links === 'string' 
                  ? JSON.parse(originalItem.links) 
                  : originalItem.links;
                return Array.isArray(links) && links.some(link => 
                  link.title?.toLowerCase().includes(searchLower) || link.url?.toLowerCase().includes(searchLower)
                );
              } catch {
                return false;
              }
            })();
            
            return titleMatch || contentMatch || categoryMatch || ringkasanMatch || pejabatMatch || fileMatch || linkMatch;
          }
        }
        
        return titleMatch || contentMatch || categoryMatch;
      });

      setResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/informasi');
      const data = await response.json();
      if (data.data) {
        const uniqueCategories = [...new Set(data.data.map((item: InformasiItem) => item.klasifikasi).filter(Boolean))] as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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
              Menampilkan hasil untuk: <span className="font-semibold">&ldquo;{query}&rdquo;</span>
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
            
            {results.map((result) => {
              const getImageUrl = () => {
                if (result.thumbnail) return result.thumbnail;
                if (result.images) {
                  try {
                    const parsedImages = JSON.parse(result.images);
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
                <div key={result.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    {/* Thumbnail */}
                    <div className="md:w-48 md:flex-shrink-0">
                      <div className="h-48 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        {getImageUrl() ? (
                          <img
                            src={getImageUrl()!}
                            alt={result.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div class="text-gray-400 text-4xl">📄</div>';
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-4xl">📄</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-1">
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
                  </div>
                </div>
              );
            })}
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}