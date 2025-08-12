"use client";

import { useState } from "react";
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
  const [pages, setPages] = useState<PageContent[]>([
    {
      id: "profil-ppid",
      title: "Profil PPID",
      slug: "profil",
      content: "<h2>Profil PPID Diskominfo Garut</h2><p>Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut adalah unit kerja yang bertanggung jawab dalam pengelolaan dan pelayanan informasi publik di lingkungan Pemerintah Kabupaten Garut.</p><h3>Visi</h3><p>Mewujudkan pelayanan informasi publik yang transparan, akuntabel, dan berkualitas untuk mendukung tata kelola pemerintahan yang baik.</p><h3>Misi</h3><ul><li>Menyelenggarakan pelayanan informasi publik yang cepat, tepat, dan mudah diakses</li><li>Meningkatkan kualitas pengelolaan informasi dan dokumentasi</li><li>Membangun sistem informasi yang terintegrasi dan terpercaya</li><li>Mendorong partisipasi masyarakat dalam pengawasan penyelenggaraan pemerintahan</li></ul><h3>Tugas dan Fungsi</h3><p>PPID memiliki tugas pokok melaksanakan pengumpulan, pengolahan, penyimpanan, pendokumentasian, penyediaan, dan pelayanan informasi publik sesuai dengan ketentuan peraturan perundang-undangan.</p>",
      files: [],
      sections: [],
      lastUpdated: "2024-01-15"
    },
    {
      id: "dip",
      title: "Daftar Informasi Publik (DIP)",
      slug: "dip", 
      content: "<h2>Daftar Informasi Publik</h2><p>Daftar Informasi Publik (DIP) adalah katalog yang berisi informasi yang wajib disediakan dan diumumkan secara berkala, informasi yang wajib diumumkan serta merta, dan informasi yang wajib tersedia setiap saat.</p><h3>Informasi Berkala</h3><ul><li>Laporan Keuangan Daerah</li><li>Laporan Kinerja Instansi Pemerintah (LAKIP)</li><li>Rencana Strategis (Renstra)</li><li>Rencana Kerja Tahunan</li><li>Laporan Penyelenggaraan Pemerintahan Daerah (LPPD)</li></ul><h3>Informasi Serta Merta</h3><ul><li>Informasi yang dapat mengancam hajat hidup orang banyak</li><li>Informasi keadaan darurat</li><li>Informasi keselamatan dan keamanan publik</li><li>Informasi yang berkaitan dengan bencana alam</li></ul><h3>Informasi Setiap Saat</h3><ul><li>Struktur Organisasi</li><li>Profil Pejabat</li><li>Peraturan Daerah dan Peraturan Bupati</li><li>Data Statistik Daerah</li><li>Prosedur Pelayanan Publik</li><li>Tarif Pelayanan</li></ul><h3>Informasi Dikecualikan</h3><p>Informasi yang dikecualikan sesuai dengan ketentuan peraturan perundang-undangan meliputi informasi yang dapat menghambat proses penegakan hukum, mengganggu kepentingan perlindungan hak atas kekayaan intelektual, dan membahayakan pertahanan dan keamanan negara.</p>",
      files: [],
      sections: [],
      lastUpdated: "2024-01-10"
    }
  ]);
  
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
    
    // Check slug uniqueness
    const existingPage = pages.find(p => p.slug === formData.slug && p.id !== selectedPage);
    if (existingPage) {
      alert('Slug sudah digunakan, gunakan slug lain!');
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      if (selectedPage) {
        // Update existing page
        setPages(prev => prev.map(page => 
          page.id === selectedPage 
            ? { ...page, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
            : page
        ));
        
        // Save to localStorage for public pages
        localStorage.setItem(`page_${selectedPage}`, JSON.stringify({
          title: formData.title,
          content: formData.content,
          files: formData.files,
          sections: formData.sections
        }));
      } else {
        // Add new page
        const newPage: PageContent = {
          id: Date.now().toString(),
          ...formData,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        setPages(prev => [...prev, newPage]);
        setSelectedPage(newPage.id);
        
        // Save to localStorage
        localStorage.setItem(`page_${newPage.id}`, JSON.stringify({
          title: formData.title,
          content: formData.content,
          files: formData.files,
          sections: formData.sections
        }));
      }
      setShowAddForm(false);
      setIsSaving(false);
      alert(selectedPage ? 'Halaman berhasil diperbarui!' : 'Halaman baru berhasil ditambahkan!');
    }, 1000);
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