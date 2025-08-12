"use client";

import { useState } from "react";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useInformasiData } from "@/hooks/useInformasiData";

export default function AdminInformasiPage() {
  const { informasi, isLoading, createInformasi, updateInformasi, deleteInformasi } = useInformasiData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    judul: '', 
    klasifikasi: 'Informasi Berkala', 
    ringkasan_isi_informasi: '',
    pejabat_penguasa_informasi: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateInformasi(editId, formData);
        alert('Informasi berhasil diperbarui');
      } else {
        await createInformasi(formData);
        alert('Informasi berhasil ditambahkan');
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ judul: '', klasifikasi: 'Informasi Berkala', ringkasan_isi_informasi: '', pejabat_penguasa_informasi: '' });
    } catch (error) {
      alert('Gagal menyimpan informasi');
    }
  };

  const handleEdit = (item: any) => {
    setFormData({ 
      judul: item.judul, 
      klasifikasi: item.klasifikasi, 
      ringkasan_isi_informasi: item.ringkasan_isi_informasi,
      pejabat_penguasa_informasi: item.pejabat_penguasa_informasi || ''
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const item = informasi.find(i => i.id === id);
    if (confirm(`Yakin ingin menghapus informasi "${item?.judul}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await deleteInformasi(id);
        alert('Informasi berhasil dihapus');
      } catch (error) {
        alert('Gagal menghapus informasi');
      }
    }
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
              <label className="block text-sm font-medium mb-1">Klasifikasi</label>
              <select
                value={formData.klasifikasi}
                onChange={(e) => setFormData({...formData, klasifikasi: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Informasi Berkala">Informasi Berkala</option>
                <option value="Informasi Setiap Saat">Informasi Setiap Saat</option>
                <option value="Informasi Serta Merta">Informasi Serta Merta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ringkasan Isi Informasi</label>
              <textarea
                value={formData.ringkasan_isi_informasi}
                onChange={(e) => setFormData({...formData, ringkasan_isi_informasi: e.target.value})}
                className="w-full border rounded px-3 py-2 h-32"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pejabat Penguasa Informasi</label>
              <input
                type="text"
                value={formData.pejabat_penguasa_informasi}
                onChange={(e) => setFormData({...formData, pejabat_penguasa_informasi: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                {editId ? 'Update' : 'Simpan'}
              </button>
              <button 
                type="button" 
                onClick={() => {setShowForm(false); setEditId(null); setFormData({ judul: '', klasifikasi: 'Informasi Berkala', ringkasan_isi_informasi: '', pejabat_penguasa_informasi: '' });}}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}