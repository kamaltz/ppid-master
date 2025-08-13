"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Tag, FileText, ExternalLink, ArrowLeft } from "lucide-react";

interface InformasiDetail {
  id: number;
  judul: string;
  klasifikasi: string;
  ringkasan_isi_informasi: string;
  tanggal_posting: string;
  pejabat_penguasa_informasi: string;
  links?: { title: string; url: string }[];
  file_attachments?: { name: string; url: string; size?: number }[];
  created_at: string;
}

export default function InformasiDetailPage() {
  const params = useParams();
  const [informasi, setInformasi] = useState<InformasiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInformasi();
  }, [params.id]);

  const fetchInformasi = async () => {
    try {
      const response = await fetch(`/api/informasi/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setInformasi(data.data);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch informasi:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
                {informasi.pejabat_penguasa_informasi || 'PPID Diskominfo Garut'}
              </div>
            </div>
          </div>

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
    </div>
  );
}