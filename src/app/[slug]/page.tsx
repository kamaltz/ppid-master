"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  links?: string;
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
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Thumbnail */}
            {page.thumbnail && (
              <div className="w-full h-64 bg-gray-200">
                <img 
                  src={page.thumbnail} 
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="p-8">
              <div 
                className="prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
              
              {/* Links */}
              {page.links && (() => {
                try {
                  const links = JSON.parse(page.links);
                  if (Array.isArray(links) && links.length > 0 && links.some(link => link.title && link.url)) {
                    return (
                      <div className="border-t pt-6 mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔗 Link Terkait</h3>
                        <div className="space-y-2">
                          {links.filter(link => link.title && link.url).map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <span>📎</span>
                              <span>{link.title}</span>
                              <span className="text-xs text-gray-500">↗</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  }
                } catch (e) {
                  console.error('Error parsing links:', e);
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}