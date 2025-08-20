"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Tag, FileText, ExternalLink, ArrowLeft } from "lucide-react";

// Function to get proper author display name
const getAuthorDisplayName = (pejabat: string) => {
  // If it's generic role display, show more specific name
  if (pejabat === 'PPID Pelaksana') {
    return 'PPID Pelaksana Diskominfo Garut';
  }
  // If it's already a proper name or other role, return as is
  return pejabat;
};

interface InformasiDetail {
  id: number;
  judul: string;
  klasifikasi: string;
  ringkasan_isi_informasi: string;
  tanggal_posting: string;
  pejabat_penguasa_informasi: string;
  thumbnail?: string;
  images?: string[];
  links?: { title: string; url: string }[];
  file_attachments?: { name: string; url: string; size?: number }[];
  created_at: string;
}

export default function InformasiDetailPage() {
  const params = useParams();
  const [informasi, setInformasi] = useState<InformasiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [fullImageSrc, setFullImageSrc] = useState('');

  const fetchInformasi = useCallback(async () => {
    try {
      const response = await fetch(`/api/informasi/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        const processedData = {
          ...data.data,
          images: data.data.images ? (typeof data.data.images === 'string' ? JSON.parse(data.data.images) : data.data.images) : [],
          links: data.data.links ? (typeof data.data.links === 'string' ? JSON.parse(data.data.links) : data.data.links) : [],
          file_attachments: data.data.file_attachments ? (typeof data.data.file_attachments === 'string' ? JSON.parse(data.data.file_attachments) : data.data.file_attachments) : []
        };
        
        console.log('Raw file_attachments:', data.data.file_attachments);
        console.log('Processed file_attachments:', processedData.file_attachments);
        setInformasi(processedData);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch informasi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchInformasi();
  }, [fetchInformasi]);

  const getCategoryName = (slug: string) => {
    const categories: Record<string, string> = {
      'informasi-berkala': 'Informasi Berkala',
      'informasi-setiap-saat': 'Informasi Setiap Saat',
      'informasi-serta-merta': 'Informasi Serta Merta'
    };
    return categories[slug] || slug;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat informasi...</p>
        </div>
      </div>
    );
  }

  if (!informasi) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Informasi Tidak Ditemukan</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Article Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                <Tag className="w-4 h-4 inline mr-1" />
                {getCategoryName(informasi.klasifikasi)}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {informasi.judul}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(informasi.tanggal_posting || informasi.created_at)}
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {getAuthorDisplayName(informasi.pejabat_penguasa_informasi || 'PPID Diskominfo Garut')}
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          {informasi.thumbnail && (
            <div className="px-8 pt-6">
              <div className="relative w-full h-[600px] overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                setFullImageSrc(informasi.thumbnail!);
                setShowFullImage(true);
              }}>
                <Image 
                  src={informasi.thumbnail} 
                  alt={informasi.judul}
                  fill
                  className="object-cover h-full"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Image Gallery */}
          {informasi.images && informasi.images.length > 0 && (
            <div className="px-8 pt-6">
              <div className="relative w-full h-[600px] overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                setFullImageSrc(informasi.images![currentImageIndex]);
                setShowFullImage(true);
              }}>
                <Image 
                  src={informasi.images[currentImageIndex]} 
                  alt={`Gallery ${currentImageIndex + 1}`}
                  fill
                  className="object-cover h-full"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                />
                {informasi.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? informasi.images!.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 text-xl font-bold backdrop-blur-sm"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === informasi.images!.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 text-xl font-bold backdrop-blur-sm"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 px-3 py-2 rounded-full backdrop-blur-sm">
                      {informasi.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-60 hover:bg-opacity-80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {informasi.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {informasi.images.map((img, index) => (
                    <div key={index} className={`relative w-16 h-16 flex-shrink-0 rounded cursor-pointer overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`} onClick={() => setCurrentImageIndex(index)}>
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Article Content */}
          <div className="p-8">
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: informasi.ringkasan_isi_informasi }}
            />
          </div>

          {/* Links Section */}
          {informasi.links && informasi.links.length > 0 && (
            <div className="px-8 py-6 bg-blue-50 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                Link Terkait
              </h3>
              <div className="space-y-2">
                {informasi.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* File Attachments */}
          {informasi.file_attachments && informasi.file_attachments.length > 0 && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                File Lampiran
              </h3>
              <div className="space-y-2">
                {informasi.file_attachments.map((file, index) => (
                  <div key={index} className="flex items-center p-3 bg-white rounded-lg border">
                    <FileText className="w-5 h-5 text-gray-500 mr-3" />
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium">{file.name}</span>
                      {file.size && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                    <a 
                      href={file.url}
                      download={file.name}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4" onClick={() => setShowFullImage(false)}>
          <div className="relative max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={fullImageSrc} 
              alt="Full size image"
              width={1920}
              height={1080}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute -top-12 right-0 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 text-2xl font-bold backdrop-blur-sm"
              title="Tutup gambar"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}