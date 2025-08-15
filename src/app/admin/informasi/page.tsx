"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ROLES, getRoleDisplayName } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useInformasiData } from "@/hooks/useInformasiData";
import { useAuth } from "@/context/AuthContext";
import { X, Upload, Link as LinkIcon, FileText } from "lucide-react";

interface Category {
  id: number;
  slug: string;
  nama: string;
}

interface InformasiItem {
  id: number;
  judul: string;
  klasifikasi: string;
  ringkasan_isi_informasi: string;
  tanggal_posting?: string;
  pejabat_penguasa_informasi?: string;
  created_at: string;
  links?: string | { title: string; url: string }[];
  file_attachments?: string | { name: string; url: string; size?: number }[];
}

export default function AdminInformasiPage() {
  const { informasi, isLoading, createInformasi, updateInformasi, deleteInformasi } = useInformasiData();
  const { getUserRole } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    judul: '', 
    klasifikasi: '', 
    ringkasan_isi_informasi: '',
    tanggal_posting: new Date().toISOString().split('T')[0],
    files: [] as File[],
    existingFiles: [] as { name: string; url: string; size?: number }[],
    links: [{ title: '', url: '' }] as { title: string; url: string }[]
  });
  const [categories, setCategories] = useState<Category[]>([]);
  
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/kategori');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0 && !formData.klasifikasi) {
          setFormData(prev => ({ ...prev, klasifikasi: data.data[0].slug }));
        }
      }
    } catch {
      console.error('Failed to fetch categories');
    }
  }, [formData.klasifikasi]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload files first
      const uploadedFiles = [];
      for (const file of formData.files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          uploadedFiles.push({
            name: uploadResult.originalName,
            url: uploadResult.url,
            size: uploadResult.size
          });
        }
      }
      
      // Combine existing files with newly uploaded files
      const allFiles = [...formData.existingFiles, ...uploadedFiles];
      
      const submitData = {
        judul: formData.judul,
        klasifikasi: formData.klasifikasi,
        ringkasan_isi_informasi: formData.ringkasan_isi_informasi,
        tanggal_posting: formData.tanggal_posting,
        pejabat_penguasa_informasi: getRoleDisplayName(getUserRole()) || 'PPID Diskominfo',
        files: allFiles,
        links: formData.links.filter(link => link.title.trim() !== '' && link.url.trim() !== '')
      };
      
      if (editId) {
        await updateInformasi(editId, submitData);
        alert('Informasi berhasil diperbarui');
      } else {
        await createInformasi(submitData);
        alert('Informasi berhasil ditambahkan');
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ 
        judul: '', 
        klasifikasi: categories.length > 0 ? categories[0].slug : '', 
        ringkasan_isi_informasi: '',
        tanggal_posting: new Date().toISOString().split('T')[0],
        files: [],
        existingFiles: [],
        links: [{ title: '', url: '' }]
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan informasi');
    }
  };

  const handleEdit = (item: InformasiItem) => {
    // Parse links if it's a JSON string
    let parsedLinks = [{ title: '', url: '' }];
    if (item.links) {
      try {
        parsedLinks = typeof item.links === 'string' ? JSON.parse(item.links) : item.links;
        if (!Array.isArray(parsedLinks) || parsedLinks.length === 0) {
          parsedLinks = [{ title: '', url: '' }];
        }
      } catch {
        parsedLinks = [{ title: '', url: '' }];
      }
    }
    
    // Parse existing files
    let existingFiles = [];
    if (item.file_attachments) {
      try {
        existingFiles = typeof item.file_attachments === 'string' ? JSON.parse(item.file_attachments) : item.file_attachments;
        if (!Array.isArray(existingFiles)) {
          existingFiles = [];
        }
      } catch {
        existingFiles = [];
      }
    }
    
    setFormData({ 
      judul: item.judul, 
      klasifikasi: item.klasifikasi, 
      ringkasan_isi_informasi: item.ringkasan_isi_informasi,
      tanggal_posting: item.tanggal_posting ? new Date(item.tanggal_posting).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      files: [],
      existingFiles: existingFiles,
      links: parsedLinks
    });
    setEditId(item.id);
    setShowForm(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };
  
  const removeFile = (index: number) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };
  
  const removeExistingFile = (index: number) => {
    setFormData(prev => ({ ...prev, existingFiles: prev.existingFiles.filter((_, i) => i !== index) }));
  };
  
  const addLink = () => {
    setFormData(prev => ({ ...prev, links: [...prev.links, { title: '', url: '' }] }));
  };
  
  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      links: prev.links.map((link, i) => i === index ? { ...link, [field]: value } : link)
    }));
  };
  
  const removeLink = (index: number) => {
    setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  };

  const handleDelete = async (id: number) => {
    const item = informasi.find(i => i.id === id);
    if (confirm(`Yakin ingin menghapus informasi "${item?.judul}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await deleteInformasi(id);
        alert('Informasi berhasil dihapus');
      } catch {
        alert('Gagal menghapus informasi');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Informasi</h1>
        <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Tambah Informasi
          </button>
        </RoleGuard>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Tambah'} Informasi</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul</label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({...formData, judul: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Posting</label>
                <input
                  type="date"
                  value={formData.tanggal_posting}
                  onChange={(e) => setFormData({...formData, tanggal_posting: e.target.value})}
                  min="2020-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                value={formData.klasifikasi}
                onChange={(e) => setFormData({...formData, klasifikasi: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.nama}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Isi Informasi</label>
              <textarea
                value={formData.ringkasan_isi_informasi}
                onChange={(e) => setFormData({...formData, ringkasan_isi_informasi: e.target.value})}
                className="w-full border rounded px-3 py-2 min-h-[200px] resize-y"
                placeholder="Masukkan isi informasi lengkap..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Gunakan format teks biasa. Paragraf baru akan dipisahkan otomatis.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">File Lampiran</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4" />
                  Pilih File
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Format: PDF, Word, Excel, JPG, PNG (Max 10MB per file)
                </p>
                
                {/* Existing Files */}
                {formData.existingFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">File yang sudah ada:</p>
                    <div className="space-y-2">
                      {formData.existingFiles.map((file, index) => (
                        <div key={`existing-${index}`} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{file.name}</span>
                            {file.size && (
                              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingFile(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Hapus file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Files */}
                {formData.files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">File baru yang akan diupload:</p>
                    <div className="space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={`new-${index}`} className="flex items-center justify-between bg-green-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Hapus file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Link Terkait</label>
              <div className="space-y-3">
                {formData.links.map((link, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <LinkIcon className="w-4 h-4 text-gray-500 mt-2" />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                          placeholder="Judul link (contoh: Dokumen Pendukung)"
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          placeholder="https://example.com"
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                      {formData.links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="text-red-500 hover:text-red-700 mt-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLink}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Tambah Link
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-700">
                <strong>Pejabat Penguasa Informasi:</strong> {getRoleDisplayName(getUserRole()) || 'PPID Diskominfo'}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                {editId ? 'Update' : 'Simpan'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false); 
                  setEditId(null); 
                  setFormData({ 
                    judul: '', 
                    klasifikasi: categories.length > 0 ? categories[0].slug : '', 
                    ringkasan_isi_informasi: '',
                    tanggal_posting: new Date().toISOString().split('T')[0],
                    files: [],
                    existingFiles: [],
                    links: [{ title: '', url: '' }]
                  });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klasifikasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pejabat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : informasi.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Belum ada informasi publik
                </td>
              </tr>
            ) : (
              informasi.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.judul}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.klasifikasi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.pejabat_penguasa_informasi || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </RoleGuard>
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]} showAccessDenied={false}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </RoleGuard>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}