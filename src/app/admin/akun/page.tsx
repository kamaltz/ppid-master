"use client";

import { useState } from "react";
import { useRoleAccess } from "@/src/lib/useRoleAccess";
import { ROLES, getRoleDisplayName } from "@/src/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { User, Mail, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Account {
  id: number;
  nama: string;
  email: string;
  role: string;
  status: string;
  tanggal_dibuat: string;
}

export default function AdminAkunPage() {
  const { userRole } = useRoleAccess();
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 1,
      nama: "PPID Utama",
      email: "ppid.utama@ppid-garut.go.id",
      role: "PPID",
      status: "Aktif",
      tanggal_dibuat: "2024-01-01"
    },
    {
      id: 2,
      nama: "PPID Pelaksana",
      email: "ppid.pelaksana@ppid-garut.go.id",
      role: "PPID_Pelaksana",
      status: "Aktif",
      tanggal_dibuat: "2024-01-02"
    },
    {
      id: 4,
      nama: "Atasan PPID",
      email: "atasan.ppid@ppid-garut.go.id",
      role: "Atasan_PPID",
      status: "Aktif",
      tanggal_dibuat: "2024-01-03"
    },
    {
      id: 3,
      nama: "Ahmad Rizki",
      email: "ahmad.rizki@email.com",
      role: "Pemohon",
      status: "Aktif",
      tanggal_dibuat: "2024-01-15"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'Pemohon'
  });
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editId) {
      setAccounts(prev => prev.map(item => 
        item.id === editId ? { ...item, ...formData } : item
      ));
      alert('Akun berhasil diperbarui!');
    } else {
      const newAccount = {
        id: Date.now(),
        ...formData,
        status: 'Aktif',
        tanggal_dibuat: new Date().toISOString().split('T')[0]
      };
      setAccounts(prev => [...prev, newAccount]);
      alert(`Akun berhasil dibuat dengan password default: ppid321`);
    }
    
    setShowForm(false);
    setEditId(null);
    setFormData({ nama: '', email: '', role: 'Pemohon' });
  };

  const handleEdit = (account: Account) => {
    setFormData({
      nama: account.nama,
      email: account.email,
      role: account.role
    });
    setEditId(account.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    const account = accounts.find(a => a.id === id);
    if (confirm(`Yakin ingin menghapus akun "${account?.nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
      setAccounts(prev => prev.filter(item => item.id !== id));
      alert('Akun berhasil dihapus');
    }
  };

  const resetPassword = (id: number) => {
    const account = accounts.find(a => a.id === id);
    if (confirm(`Yakin ingin reset password akun "${account?.nama}" ke default (ppid321)?`)) {
      alert('Password berhasil direset ke: ppid321');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'PPID': return 'bg-blue-100 text-blue-800';
      case 'PPID_Pelaksana': return 'bg-green-100 text-green-800';
      case 'Atasan_PPID': return 'bg-purple-100 text-purple-800';
      case 'Pemohon': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RoleGuard requiredRoles={[ROLES.ADMIN]}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Kelola Akun</h1>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Akun
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Tambah'} Akun</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Pemohon">Pemohon</option>
                  <option value="PPID">PPID Utama</option>
                  <option value="PPID_Pelaksana">PPID Pelaksana</option>
                  <option value="Atasan_PPID">Atasan PPID (Monitoring)</option>
                </select>
              </div>
              
              {!editId && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-700">
                    Password default: <strong>ppid321</strong>
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editId ? 'Update' : 'Buat Akun'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false); 
                    setEditId(null); 
                    setFormData({ nama: '', email: '', role: 'Pemohon' });
                  }}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Dibuat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{account.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{account.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(account.role)}`}>
                      {getRoleDisplayName(account.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{account.tanggal_dibuat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button 
                      onClick={() => handleEdit(account)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => resetPassword(account.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Reset Password"
                    >
                      {showPassword[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGuard>
  );
}
