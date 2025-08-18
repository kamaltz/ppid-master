"use client";

import { useState, useEffect, useCallback } from "react";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";


interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  files: FileItem[];
  sections?: unknown[];
  lastUpdated: string;
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
    sections: [] as unknown[]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const handleAutoSave = useCallback(async () => {
    if (!selectedPage || !hasUnsavedChanges) return;
    
    setAutoSaveStatus('saving');
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/pages/${selectedPage}`, {
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
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
    } catch {
      setAutoSaveStatus('unsaved');
    }
  }, [selectedPage, hasUnsavedChanges, formData]);

  const handleSave = useCallback(async () => {
    if (!formData.title || !formData.slug) {
      alert('Judul dan slug harus diisi!');
      return;
    }
    
    setIsSaving(true);
    try {
      if (selectedPage) {
        // Update existing page
        const token = localStorage.getItem('auth_token');
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
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/pages', {
          method: 'POST',
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
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
    } catch {
      console.error('Error saving page');
      alert('Terjadi kesalahan saat menyimpan halaman');
    } finally {
      setIsSaving(false);
    }
  }, [formData, selectedPage]);

  const handleAddPage = useCallback(() => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      files: [],
      sections: []
    });
    setSelectedPage(null);
    setShowAddForm(true);
  }, []);

  useEffect(() => {
    fetchPages();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || (!selectedPage && !showAddForm)) return;
    
    const autoSaveTimer = setTimeout(() => {
      if (formData.title && formData.slug) {
        handleAutoSave();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity
    
    return () => clearTimeout(autoSaveTimer);
  }, [formData, hasUnsavedChanges, selectedPage, showAddForm, handleAutoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          if (formData.title && formData.slug) {
            handleSave();
          }
        }
        if (e.key === 'n') {
          e.preventDefault();
          handleAddPage();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, handleSave, handleAddPage]);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const result = await response.json();
      if (result.success) {
        setPages(result.data.map((page: { id: string; title: string; slug: string; content?: string; updated_at?: string; created_at: string }) => ({
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content || '',
          files: [],
          sections: [],
          lastUpdated: new Date(page.updated_at || page.created_at).toISOString().split('T')[0]
        })));
      }
    } catch {
      console.error('Error fetching pages');
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
    setHasUnsavedChanges(true);
    setAutoSaveStatus('unsaved');
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
    setHasUnsavedChanges(true);
    setAutoSaveStatus('unsaved');
  };

  const handleSlugChange = (slug: string) => {
    setFormData(prev => ({ ...prev, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
    setHasUnsavedChanges(true);
    setAutoSaveStatus('unsaved');
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    const newFile: FileItem = {
      id: Date.now() + Math.random().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    };
    
    setFormData(prev => ({ ...prev, files: [...prev.files, newFile] }));
    return newFile.url || '';
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
          <div className="bg-white rounded-lg shadow-md">
            {/* Sidebar Header */}
            <div className="border-b p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  📁 Halaman Website
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {pages.length} halaman
                </span>
              </div>
              <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
                <button
                  onClick={handleAddPage}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  ➕ Buat Halaman Baru
                </button>
              </RoleGuard>
            </div>

            {/* Pages List */}
            <div className="p-4">
              <div className="space-y-2">
                {pages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">📄</div>
                    <p className="text-sm">Belum ada halaman</p>
                    <p className="text-xs">Buat halaman pertama Anda</p>
                  </div>
                ) : (
                  pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => handlePageSelect(page.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 ${
                        selectedPage === page.id && !showAddForm
                          ? 'bg-blue-50 border-blue-300 shadow-sm' 
                          : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-gray-800 text-sm leading-tight">
                          {page.title}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-xs text-green-600 font-medium">Live</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-1 font-mono bg-gray-100 px-2 py-1 rounded">
                        /{page.slug}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>📅 {page.lastUpdated}</span>
                        <span className="text-blue-600">✏️ Edit</span>
                      </div>
                    </button>
                  ))
                )}
                
                {showAddForm && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 border-dashed">
                    <div className="flex items-center gap-2 font-semibold text-green-800 mb-1">
                      ✨ Halaman Baru
                    </div>
                    <div className="text-sm text-green-600">Sedang dalam proses pembuatan...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-t p-4 bg-gray-50">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Total Halaman:</span>
                  <span className="font-semibold">{pages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-semibold">Semua Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedPage || showAddForm ? (
            <div className="bg-white rounded-lg shadow-md">
              {/* Header */}
              <div className="border-b p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {showAddForm ? '📝 Buat Halaman Baru' : `✏️ Edit: ${formData.title}`}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {showAddForm ? 'Buat halaman baru untuk website PPID' : 'Edit konten halaman yang sudah ada'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {formData.slug && (
                      <a
                        href={`/${formData.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        👁️ Preview
                      </a>
                    )}
                    <div className="flex items-center gap-3">
                      {/* Auto-save status */}
                      <div className="flex items-center gap-2 text-sm">
                        {autoSaveStatus === 'saved' && (
                          <span className="text-green-600 flex items-center gap-1">
                            ✓ Tersimpan
                          </span>
                        )}
                        {autoSaveStatus === 'saving' && (
                          <span className="text-blue-600 flex items-center gap-1">
                            ⏳ Menyimpan...
                          </span>
                        )}
                        {autoSaveStatus === 'unsaved' && (
                          <span className="text-orange-600 flex items-center gap-1">
                            ⚠️ Belum tersimpan
                          </span>
                        )}
                      </div>
                      
                      <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
                        <button
                          onClick={handleSave}
                          disabled={isSaving || !formData.title || !formData.slug}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                          title="Simpan (Ctrl+S)"
                        >
                          {isSaving ? (
                            <>⏳ Menyimpan...</>
                          ) : (
                            <>{showAddForm ? '✨ Buat Halaman' : '💾 Simpan Perubahan'}</>
                          )}
                        </button>
                      </RoleGuard>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-8">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📄 Judul Halaman *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 text-lg transition-colors"
                      placeholder="Contoh: Profil PPID Garut"
                      autoFocus={showAddForm}
                    />
                    <p className="text-xs text-gray-500 mt-1">Judul akan muncul di halaman dan menu navigasi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔗 URL Halaman *
                    </label>
                    <div className="flex items-center border-2 border-gray-200 focus-within:border-blue-500 rounded-lg transition-colors">
                      <span className="px-3 text-gray-500 text-sm font-medium">/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="flex-1 px-3 py-3 border-0 focus:ring-0 text-lg"
                        placeholder="profil-ppid"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">URL otomatis dibuat dari judul, bisa diedit manual</p>
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ✍️ Konten Halaman
                  </label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      onFileUpload={handleFileUpload}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Gunakan toolbar untuk format teks, tambah gambar, link, dan lainnya</p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      📎 File Lampiran
                    </h4>
                    <FileUpload
                      files={formData.files}
                      onFilesChange={(files) => setFormData({...formData, files})}
                    />
                    <p className="text-xs text-gray-500 mt-2">Upload dokumen, gambar, atau file pendukung lainnya</p>
                  </div>


                </div>

                {/* Preview Info & Shortcuts */}
                <div className="grid md:grid-cols-2 gap-4">
                  {formData.slug && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        🌐 Informasi Publikasi
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-700">URL Halaman:</span>
                          <code className="bg-white px-2 py-1 rounded text-sm border">
                            /{formData.slug}
                          </code>
                          <a
                            href={`/${formData.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Buka →
                          </a>
                        </div>
                        <p className="text-xs text-blue-600">
                          💡 Halaman akan langsung dapat diakses publik setelah disimpan
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      ⌨️ Shortcut Keyboard
                    </h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Simpan halaman:</span>
                        <kbd className="bg-white px-2 py-1 rounded border text-xs">Ctrl + S</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Halaman baru:</span>
                        <kbd className="bg-white px-2 py-1 rounded border text-xs">Ctrl + N</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto-save:</span>
                        <span className="text-green-600">3 detik</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-6">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Selamat Datang di Editor Halaman</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Pilih halaman yang ingin diedit dari sidebar, atau buat halaman baru untuk website PPID Garut.
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Editor teks lengkap dengan formatting</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Upload file dan gambar</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Preview langsung sebelum publish</span>
                </div>
              </div>
              <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
                <button
                  onClick={handleAddPage}
                  className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  ✨ Buat Halaman Baru
                </button>
              </RoleGuard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}