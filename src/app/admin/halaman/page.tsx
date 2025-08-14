"use client";

import { useState, useEffect } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import PagePreview from "@/components/ui/PagePreview";
import SectionEditor from "@/components/ui/SectionEditor";

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  files: FileItem[];
  sections: Section[];
  lastUpdated: string;
}

interface Section {
  id: string;
  title: string;
  content: string;
  type: "text" | "image" | "file" | "hero";
  order: number;
  files: any[];
}

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export default function AdminHalamanPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    files: [] as FileItem[],
    sections: [] as Section[]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const result = await response.json();
      if (result.success) {
        setPages(result.data.map((page: any) => ({
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content || '',
          files: [],
          sections: [],
          lastUpdated: new Date(page.updated_at || page.created_at).toISOString().split('T')[0]
        })));
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        files: page.files,
        sections: page.sections || []
      });
      setSelectedPage(pageId);
      setShowAddForm(false);
    }
  };

  const handleAddPage = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      files: [],
      sections: []
    });
    setSelectedPage(null);
    setShowAddForm(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      alert('Judul dan slug harus diisi!');
      return;
    }
    
    setIsSaving(true);
    try {
      if (selectedPage) {
        // Update existing page
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pages/${selectedPage}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            status: 'published'
          })
        });
        
        const result = await response.json();
        if (result.success) {
          setPages(prev => prev.map(page => 
            page.id === selectedPage 
              ? { ...page, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
              : page
          ));
          alert('Halaman berhasil diperbarui!');
        } else {
          alert(result.error || 'Gagal memperbarui halaman');
        }
      } else {
        // Add new page
        const response = await fetch('/api/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            status: 'published'
          })
        });
        
        const result = await response.json();
        if (result.success) {
          const newPage: PageContent = {
            id: result.data.id,
            title: result.data.title,
            slug: result.data.slug,
            content: result.data.content,
            files: [],
            sections: [],
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          setPages(prev => [...prev, newPage]);
          setSelectedPage(newPage.id);
          alert('Halaman baru berhasil ditambahkan!');
        } else {
          alert(result.error || 'Gagal membuat halaman');
        }
      }
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Terjadi kesalahan saat menyimpan halaman');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (files: FileList) => {
    const newFiles: FileItem[] = Array.from(files).map(file => ({
      id: Date.now() + Math.random().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat halaman...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Kelola Halaman</h1>
      
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pilih Halaman</h3>
              <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
                <button
                  onClick={handleAddPage}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Tambah
                </button>
              </RoleGuard>
            </div>
            <div className="space-y-2">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handlePageSelect(page.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPage === page.id && !showAddForm
                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{page.title}</div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Live</span>
                  </div>
                  <div className="text-sm text-gray-500">/{page.slug}</div>
                  <div className="text-xs text-gray-400">Update: {page.lastUpdated}</div>
                  <div className="text-xs text-blue-600 mt-1">Halaman aktif - dapat diedit</div>
                </button>
              ))}
              
              {showAddForm && (
                <div className="p-3 rounded-lg bg-green-100 border border-green-300">
                  <div className="font-medium text-green-800">Halaman Baru</div>
                  <div className="text-sm text-green-600">Sedang membuat...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedPage || showAddForm ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {showAddForm ? 'Tambah Halaman Baru' : `Edit: ${formData.title}`}
                </h2>
                <div className="flex gap-3">
                  <PagePreview
                    title={formData.title}
                    content={formData.content}
                    files={formData.files}
                  />
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg"
                    >
                      {isSaving ? 'Menyimpan...' : (showAddForm ? 'Buat Halaman' : 'Simpan Halaman')}
                    </button>
                  </RoleGuard>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Judul Halaman</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Masukkan judul halaman"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slug URL</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                      className="flex-1 border rounded-lg px-3 py-2"
                      placeholder="url-halaman"
                      pattern="[a-z0-9-]+"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Hanya huruf kecil, angka, dan tanda hubung</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Konten Halaman</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({...formData, content: value})}
                    onFileUpload={handleFileUpload}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">File Lampiran</label>
                  <FileUpload
                    files={formData.files}
                    onFilesChange={(files) => setFormData({...formData, files})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kelola Section</label>
                  <SectionEditor
                    sections={formData.sections}
                    onSectionsChange={(sections) => setFormData({...formData, sections})}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Preview URL:</h4>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      /{formData.slug || 'url-halaman'}
                    </code>
                    {(selectedPage === 'profil-ppid' || selectedPage === 'dip') && (
                      <a
                        href={`/${formData.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Lihat Halaman Live
                      </a>
                    )}
                  </div>
                  {formData.slug && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(selectedPage === 'profil-ppid' || selectedPage === 'dip') 
                        ? 'Halaman ini sudah live dan dapat diakses publik'
                        : 'Halaman akan dapat diakses di URL ini setelah disimpan'
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Halaman untuk Diedit</h3>
              <p className="text-gray-500">Pilih halaman dari sidebar untuk mulai mengedit konten.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}