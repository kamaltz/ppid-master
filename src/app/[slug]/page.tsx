"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  const fetchPage = useCallback(async () => {
    if (!slug) return;
    
    try {
      const response = await fetch('/api/pages');
      const result = await response.json();
      
      if (result.success) {
        const foundPage = result.data.find((p: PageData) => p.slug === slug);
        if (foundPage) {
          setPage(foundPage);
        } else {
          notFound();
        }
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPage();
  }, [slug, fetchPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat halaman...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          <p className="text-blue-100">
            Terakhir diperbarui: {new Date(page.updated_at).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 PPID Kabupaten Garut. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}