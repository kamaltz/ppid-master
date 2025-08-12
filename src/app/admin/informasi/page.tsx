"use client";

import { useState, useEffect } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";

interface Informasi {
  id: number;
  judul: string;
  kategori: string;
  status: string;
  tanggal: string;
  konten: string;
  files: FileItem[];
}

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export default function AdminInformasiPage() {
  const [informasi, setInformasi] = useState<Informasi[]>([
    {
      id: 1,
      judul: "Laporan Keuangan 2023",
      kategori: "Berkala",
      status: "Aktif",
      tanggal: "2024-01-15",
      konten: "<p>Laporan keuangan tahun 2023 telah tersedia untuk diunduh.</p>",
      files: []
    },
    {
      id: 2,
      judul: "Struktur Organisasi",
      kategori: "Setiap Saat",
      status: "Aktif",
      tanggal: "2024-01-10",
      konten: "<p>Struktur organisasi Diskominfo Kabupaten Garut.</p>",
      files: []
    }
  ]);
  
  // Save to localStorage on component mount and updates
  useEffect(() => {
    localStorage.setItem('informasi_data', JSON.stringify(informasi));
  }, [informasi]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    judul: '', 
    kategori: 'Berkala', 
    status: 'Aktif', 
    konten: '',
    files: [] as FileItem[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setInformasi(prev => prev.map(item => 
        item.id === editId ? { ...item, ...formData } : item
      ));
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        tanggal: new Date().toISOString().split('T')[0]
      };
      setInformasi(prev => [...prev, newItem]);
    }
    setShowForm(false);
    setEditId(null);
    setFormData({ judul: '', kategori: 'Berkala', status: 'Aktif', konten: '', files: [] });
  };

  const handleEdit = (item: Informasi) => {
    setFormData({ 
      judul: item.judul, 
      kategori: item.kategori, 
      status: item.status,
      konten: item.konten,
      files: item.files
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    const item = informasi.find(i => i.id === id);
    if (confirm(`Yakin ingin menghapus informasi "${item?.judul}"? Tindakan ini tidak dapat dibatalkan.`)) {
      setInformasi(prev => prev.filter(item => item.id !== id));
      alert('Informasi berhasil dihapus');
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Informasi</h1>
        <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Berkala">Berkala</option>
                <option value="Setiap Saat">Setiap Saat</option>
                <option value="Serta Merta">Serta Merta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konten</label>
              <RichTextEditor
                value={formData.konten}
                onChange={(value) => setFormData({...formData, konten: value})}
                onFileUpload={handleFileUpload}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File Lampiran</label>
              <FileUpload
                files={formData.files}
                onFilesChange={(files) => setFormData({...formData, files})}
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                {editId ? 'Update' : 'Simpan'}
              </button>
              <button 
                type="button" 
                onClick={() => {setShowForm(false); setEditId(null); setFormData({ judul: '', kategori: 'Berkala', status: 'Aktif', konten: '', files: [] });}}
                className="bg-gray-500 text-white px-4 py-2 rounded"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {informasi.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.judul}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.kategori}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tanggal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.files.length > 0 ? `${item.files.length} file(s)` : 'Tidak ada'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID]} showAccessDenied={false}>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </RoleGuard>
                  <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </RoleGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}