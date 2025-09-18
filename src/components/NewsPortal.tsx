"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Eye, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function NewsPortal() {
  const [informasi, setInformasi] = useState<Informasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchInformasi = async () => {
      try {
        const response = await fetch('/api/informasi?limit=20');
        const data = await response.json();
        
        if (data.success) {
          console.log('Informasi data:', data.data);
          setInformasi(data.data || []);
        }
      } catch (error) {
        console.warn('Failed to fetch informasi:', error);
        setInformasi([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInformasi();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const sliderNews = informasi.slice(1, 13);
    if (sliderNews.length <= 3) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const maxSlide = Math.max(0, sliderNews.length - 3);
        return prev >= maxSlide ? 0 : prev + 1;
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [informasi]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat informasi...</p>
      </div>
    );
  }

  // Helper function to get image URL
  const getImageUrl = (item: Informasi) => {
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

  const featuredNews = informasi[0];
  const sliderNews = informasi.slice(1, 13); // Up to 12 items for slider
  const sidebarNews = informasi.slice(4, 12);

  
  const nextSlide = () => {
    const maxSlide = Math.max(0, sliderNews.length - 3);
    setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1);
  };
  
  const prevSlide = () => {
    const maxSlide = Math.max(0, sliderNews.length - 3);
    setCurrentSlide(prev => prev <= 0 ? maxSlide : prev - 1);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            📰 Informasi Terbaru
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dapatkan informasi terkini dan terpercaya dari PPID Kabupaten Garut
          </p>
        </div>

        {informasi.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Informasi</h3>
            <p className="text-gray-500">Informasi terbaru akan segera hadir</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured News */}
              {featuredNews && (
                <Link href={`/informasi/${featuredNews.id}`}>
                  <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="md:flex">
                      <div className="md:w-1/2">
                        <div className="h-64 md:h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          {getImageUrl(featuredNews) ? (
                            <img
                              src={getImageUrl(featuredNews)!}
                              alt={featuredNews.judul}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log('Image loaded:', getImageUrl(featuredNews))}
                              onError={(e) => {
                                console.log('Image error:', getImageUrl(featuredNews));
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="text-white text-6xl">📄</div>';
                              }}
                            />
                          ) : (
                            <div className="text-white text-6xl">📄</div>
                          )}
                        </div>
                      </div>
                      <div className="md:w-1/2 p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                            {featuredNews.klasifikasi}
                          </span>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(featuredNews.tanggal_posting || featuredNews.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {featuredNews.judul}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {featuredNews.ringkasan_isi_informasi}
                        </p>
                        <div className="flex items-center text-blue-600 font-medium text-sm">
                          <span>Baca Selengkapnya</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* News Slider */}
              {sliderNews.length > 0 && (
                <div className="relative">
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
                    >
                      {sliderNews.map((item) => (
                        <div key={item.id} className="w-1/3 flex-shrink-0 px-3">
                          <Link href={`/informasi/${item.id}`}>
                            <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300">
                              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                {getImageUrl(item) ? (
                                  <img
                                    src={getImageUrl(item)!}
                                    alt={item.judul}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.parentElement!.innerHTML = '<div class="text-gray-400 text-3xl flex items-center justify-center h-full">📄</div>';
                                    }}
                                  />
                                ) : (
                                  <div className="text-gray-400 text-3xl">📄</div>
                                )}
                              </div>
                              <div className="p-4">
                                <div className="flex items-center text-gray-500 text-xs mb-2">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(item.tanggal_posting || item.created_at).toLocaleDateString('id-ID')}
                                </div>
                                <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {item.judul}
                                </h4>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Navigation Arrows */}
                  {sliderNews.length > 3 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </>
                  )}
                  
                  {/* Dots Indicator */}
                  {sliderNews.length > 3 && (
                    <div className="flex justify-center mt-6 space-x-2">
                      {Array.from({ length: Math.max(0, sliderNews.length - 2) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Right Column (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  📋 Informasi Lainnya
                </h3>
                
                {sidebarNews.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {sidebarNews.map((item, index) => (
                      <div key={item.id}>
                        <Link href={`/informasi/${item.id}`}>
                          <div className="group cursor-pointer">
                            <h4 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                              {item.judul}
                            </h4>
                            <div className="flex items-center text-gray-500 text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(item.tanggal_posting || item.created_at).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                        </Link>
                        {index < sidebarNews.length - 1 && (
                          <div className="border-b border-dashed border-gray-300 mt-3"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Tidak ada informasi lainnya</p>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link href="/informasi">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Lihat Selengkapnya
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}