"use client";

import { useState, useEffect } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES, getRoleDisplayName } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { User, Mail, Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Account {
  id: string;
  nama: string;
  email: string;
  role: string;
  status: string;
  tanggal_dibuat: string;
  nik?: string;
  table?: string;
}

export default function AdminAkunPage() {
  const { userRole } = useRoleAccess();
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'Pemohon'
  });
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDelete = (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (confirm(`Yakin ingin menghapus akun "${account?.nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
      setAccounts(prev => prev.filter(item => item.id !== id));
      alert('Akun berhasil dihapus');
    }
  };

  const handleViewDetail = (account: Account) => {
    setSelectedAccount(account);
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
    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]}>
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
                  <option value="Admin">Admin</option>
                  <option value="PPID_UTAMA">PPID Utama</option>
                  <option value="PPID_PELAKSANA">PPID Pelaksana</option>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Belum ada akun terdaftar
                  </td>
                </tr>
              ) : accounts.map((account) => (
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
                      onClick={() => handleViewDetail(account)}
                      className="text-green-600 hover:text-green-900"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(account)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
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
        
        {/* Detail Modal */}
        {selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Detail Akun</h3>
                <button 
                  onClick={() => setSelectedAccount(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900">{selectedAccount.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                  <p className="text-gray-900">{selectedAccount.nama}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedAccount.email}</p>
                </div>
                {selectedAccount.role === 'Pemohon' && selectedAccount.nik && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">NIK</label>
                    <p className="text-gray-900">{selectedAccount.nik}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedAccount.role)}`}>
                    {getRoleDisplayName(selectedAccount.role)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {selectedAccount.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tanggal Dibuat</label>
                  <p className="text-gray-900">{selectedAccount.tanggal_dibuat}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setSelectedAccount(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
