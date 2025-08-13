"use client";

import { useState, useEffect } from "react";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { Plus, Edit, Trash2, X } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

interface Kategori {
  id: number;
  nama: string;
  slug: string;
  deskripsi?: string;
  created_at: string;
}

export default function AdminKategoriPage() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    slug: '',
    deskripsi: ''
  });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'success';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'warning', onConfirm: () => {} });
  
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      const response = await fetch('/api/kategori');
      const data = await response.json();
      if (data.success) {
        setKategori(data.data);
      } else {
        console.error('API Error:', data.error);
        // Use default categories if database table doesn't exist
        setKategori([
          { id: 1, nama: "Informasi Berkala", slug: "informasi-berkala", deskripsi: "Informasi yang wajib disediakan secara berkala", created_at: "2024-01-01" },
          { id: 2, nama: "Informasi Setiap Saat", slug: "informasi-setiap-saat", deskripsi: "Informasi yang wajib disediakan setiap saat", created_at: "2024-01-02" },
          { id: 3, nama: "Informasi Serta Merta", slug: "informasi-serta-merta", deskripsi: "Informasi yang wajib diumumkan serta merta", created_at: "2024-01-03" }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Use default categories as fallback
      setKategori([
        { id: 1, nama: "Informasi Berkala", slug: "informasi-berkala", deskripsi: "Informasi yang wajib disediakan secara berkala", created_at: "2024-01-01" },
        { id: 2, nama: "Informasi Setiap Saat", slug: "informasi-setiap-saat", deskripsi: "Informasi yang wajib disediakan setiap saat", created_at: "2024-01-02" },
        { id: 3, nama: "Informasi Serta Merta", slug: "informasi-serta-merta", deskripsi: "Informasi yang wajib diumumkan serta merta", created_at: "2024-01-03" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (nama: string) => {
    return nama
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Unauthorized');
        return;
      }

      if (editId) {
        const response = await fetch(`/api/kategori/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (data.success) {
          setSuccessModal({
            isOpen: true,
            title: 'Berhasil Diperbarui',
            message: `Kategori "${formData.nama}" berhasil diperbarui.`
          });
          fetchKategori();
        } else {
          alert(data.error || 'Gagal memperbarui kategori');
        }
      } else {
        const response = await fetch('/api/kategori', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (data.success) {
          setSuccessModal({
            isOpen: true,
            title: 'Berhasil Ditambahkan',
            message: `Kategori "${formData.nama}" berhasil ditambahkan.`
          });
          fetchKategori();
        } else {
          alert(data.error || 'Gagal menambahkan kategori');
        }
      }
      
      setShowForm(false);
      setEditId(null);
      setFormData({ nama: '', slug: '', deskripsi: '' });
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  const handleEdit = (item: Kategori) => {
    setFormData({
      nama: item.nama,
      slug: item.slug,
      deskripsi: item.deskripsi || ''
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    const item = kategori.find(k => k.id === id);
    if (!item) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Kategori',
      message: `Apakah Anda yakin ingin menghapus kategori "${item.nama}"? Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            alert('Unauthorized');
            return;
          }

          const response = await fetch(`/api/kategori/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          if (data.success) {
            setConfirmModal({ ...confirmModal, isOpen: false });
            setSuccessModal({
              isOpen: true,
              title: 'Berhasil Dihapus',
              message: `Kategori "${item.nama}" berhasil dihapus.`
            });
            fetchKategori();
          } else {
            alert(data.error || 'Gagal menghapus kategori');
          }
        } catch (error) {
          alert('Terjadi kesalahan');
        }
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Kategori Informasi</h1>
        <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </button>
        </RoleGuard>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Tambah'} Kategori</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Kategori</label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => {
                  const nama = e.target.value;
                  setFormData({
                    ...formData, 
                    nama,
                    slug: generateSlug(nama)
                  });
                }}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="kategori-slug"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Digunakan untuk URL dan filter. Hanya huruf kecil, angka, dan tanda hubung.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="Deskripsi kategori (opsional)"
              />
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
                  setFormData({ nama: '', slug: '', deskripsi: '' });
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Dibuat</th>
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
            ) : kategori.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Belum ada kategori informasi
                </td>
              </tr>
            ) : kategori.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nama}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{item.slug}</code>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {item.deskripsi || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]} showAccessDenied={false}>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </RoleGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
      
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}