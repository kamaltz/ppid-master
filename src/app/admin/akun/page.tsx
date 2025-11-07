"use client";

import { useState, useEffect, useCallback } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES, getRoleDisplayName } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { Plus, Edit, Trash2, Key, Upload, Download, Settings } from "lucide-react";
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
  const { } = useRoleAccess();
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'PEMOHON'
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: 'delete' | 'reset' | 'save' | 'bulk-delete' | 'bulk-reset', data?: string | string[] | {nama: string; email: string; role: string}}>({type: 'delete'});
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState('Garut@2025?');
  const [newPassword, setNewPassword] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAccounts = useCallback(async () => {
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
        setFilteredAccounts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchDefaultPassword = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/settings/default-password', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDefaultPassword(data.password);
      }
    } catch (error) {
      console.error('Failed to fetch default password:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
    fetchDefaultPassword();
  }, [fetchAccounts, fetchDefaultPassword]);

  useEffect(() => {
    let filtered = [...accounts];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(account => account.role === roleFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.nama.localeCompare(b.nama);
      } else if (sortBy === 'date') {
        comparison = new Date(a.tanggal_dibuat).getTime() - new Date(b.tanggal_dibuat).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredAccounts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [accounts, roleFilter, sortBy, sortOrder, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmAction({type: 'save', data: {...formData}});
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    if (!token) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      if (editId) {
        // Extract numeric ID from prefixed ID (e.g., 'ppid_2' -> '2')
        const numericId = editId.includes('_') ? editId.split('_')[1] : editId;
        const response = await fetch(`/api/accounts/${numericId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
          setSuccessMessage('Akun berhasil diperbarui');
          setShowSuccessModal(true);
          fetchAccounts();
        } else {
          alert(data.error || 'Gagal memperbarui akun');
        }
      } else {
        const response = await fetch('/api/accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
          setSuccessMessage(`Akun berhasil dibuat dengan password default: ${defaultPassword}`);
          setShowSuccessModal(true);
          fetchAccounts();
        } else {
          alert(data.error || 'Gagal membuat akun');
        }
      }
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Terjadi kesalahan saat menyimpan akun');
    }
    
    setShowForm(false);
    setEditId(null);
    setFormData({ nama: '', email: '', role: 'PEMOHON' });
    setShowConfirmModal(false);
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
    setConfirmAction({type: 'delete', data: id});
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    const id = confirmAction.data as string;
    if (!token) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      const response = await fetch('/api/accounts/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountId: id })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Akun berhasil dihapus');
        setShowSuccessModal(true);
        fetchAccounts();
      } else {
        alert(data.error || 'Gagal menghapus akun');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Terjadi kesalahan saat menghapus akun');
    }
    setShowConfirmModal(false);
  };

  const handleResetPassword = (id: string) => {
    setConfirmAction({type: 'reset', data: id});
    setShowConfirmModal(true);
  };

  const confirmResetPassword = async () => {
    const id = confirmAction.data as string;
    if (!token) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      const response = await fetch('/api/accounts/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountId: id })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`Password berhasil direset ke: ${defaultPassword}`);
        setShowSuccessModal(true);
      } else {
        alert(data.error || 'Gagal reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Terjadi kesalahan saat reset password');
    }
    setShowConfirmModal(false);
  };

  const handleBulkDelete = () => {
    if (selectedAccounts.length === 0) {
      alert('Pilih akun yang ingin dihapus');
      return;
    }
    setConfirmAction({type: 'bulk-delete', data: selectedAccounts});
    setShowConfirmModal(true);
  };

  const handleBulkResetPassword = () => {
    if (selectedAccounts.length === 0) {
      alert('Pilih akun yang ingin direset passwordnya');
      return;
    }
    setConfirmAction({type: 'bulk-reset', data: selectedAccounts});
    setShowConfirmModal(true);
  };

  const confirmBulkDelete = async () => {
    const ids = confirmAction.data as string[];
    if (!token || !ids) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      for (const id of ids) {
        await fetch('/api/accounts/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ accountId: id })
        });
      }
      
      setSuccessMessage(`${ids?.length || 0} akun berhasil dihapus`);
      setShowSuccessModal(true);
      fetchAccounts();
      setSelectedAccounts([]);
    } catch (error) {
      console.error('Error bulk deleting accounts:', error);
      alert('Terjadi kesalahan saat menghapus akun');
    }
    setShowConfirmModal(false);
  };

  const confirmBulkResetPassword = async () => {
    const ids = confirmAction.data as string[];
    if (!token || !ids) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      for (const id of ids) {
        await fetch('/api/accounts/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ accountId: id })
        });
      }
      
      setSuccessMessage(`Password ${ids?.length || 0} akun berhasil direset ke: ${defaultPassword}`);
      setShowSuccessModal(true);
      setSelectedAccounts([]);
    } catch (error) {
      console.error('Error bulk resetting passwords:', error);
      alert('Terjadi kesalahan saat reset password');
    }
    setShowConfirmModal(false);
  };

  const handleSelectAll = (checked: boolean) => {
    const currentPageAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    if (checked) {
      const newSelected = [...selectedAccounts, ...currentPageAccounts.map(account => account.id).filter(id => !selectedAccounts.includes(id))];
      setSelectedAccounts(newSelected);
    } else {
      const currentPageIds = currentPageAccounts.map(account => account.id);
      setSelectedAccounts(selectedAccounts.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleSelectAccount = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts([...selectedAccounts, accountId]);
    } else {
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
    }
  };

  const handleImport = async () => {
    if (!importFile || !token) {
      alert('Pilih file CSV terlebih dahulu');
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/accounts/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(data.message);
        setShowSuccessModal(true);
        if (data.errors && data.errors.length > 0) {
          console.warn('Import errors:', data.errors);
        }
        fetchAccounts();
        setShowImportModal(false);
        setImportFile(null);
      } else {
        alert(data.error || 'Gagal mengimpor akun');
        if (data.details) {
          console.error('Import details:', data.details);
        }
      }
    } catch (error) {
      console.error('Error importing accounts:', error);
      alert('Terjadi kesalahan saat mengimpor akun');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'nama,email,role\nJohn Doe,john@example.com,PEMOHON\nJane Smith,jane@example.com,PPID_PELAKSANA';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-import-akun.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }
    try {
      const response = await fetch('/api/settings/default-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Password default berhasil diubah');
        setShowSuccessModal(true);
        setDefaultPassword(newPassword);
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        alert(data.error || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Terjadi kesalahan');
    }
  };





  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'PPID_UTAMA': return 'bg-blue-100 text-blue-800';
      case 'PPID_PELAKSANA': return 'bg-green-100 text-green-800';
      case 'PEMOHON': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA]}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Kelola Akun</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Password Default
            </button>
            <button 
              onClick={downloadTemplate}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Template CSV
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Akun
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Tampilkan:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter Role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="ALL">Semua Role</option>
                <option value="ADMIN">Admin</option>
                <option value="PPID_UTAMA">PPID Utama</option>
                <option value="PPID_PELAKSANA">PPID Pelaksana</option>
                <option value="PEMOHON">Pemohon</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Urutkan:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="name">Nama (A-Z)</option>
                <option value="date">Tanggal Dibuat</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Urutan:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              Menampilkan {Math.min(itemsPerPage, filteredAccounts.length)} dari {filteredAccounts.length} akun
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Tambah'} Akun</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role || 'PEMOHON'}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="PEMOHON">Pemohon</option>
                  <option value="ADMIN">Admin</option>
                  <option value="PPID_UTAMA">PPID Utama</option>
                  <option value="PPID_PELAKSANA">PPID Pelaksana</option>
                </select>
              </div>
              
              {!editId && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-700">
                    Password default: <strong>{defaultPassword}</strong>
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editId ? 'Update' : 'Simpan'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setFormData({ nama: '', email: '', role: 'PEMOHON' });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedAccounts.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedAccounts.length} akun dipilih dari {filteredAccounts.length} yang ditampilkan
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkResetPassword}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Reset Password
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={(() => {
                      const currentPageAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                      return currentPageAccounts.length > 0 && currentPageAccounts.every(account => selectedAccounts.includes(account.id));
                    })()}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
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
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {accounts.length === 0 ? 'Belum ada akun' : 'Tidak ada akun yang sesuai filter'}
                  </td>
                </tr>
              ) : (
                filteredAccounts
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(account.id)}
                        onChange={(e) => handleSelectAccount(account.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{account.nama}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{account.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(account.role)}`}>
                        {getRoleDisplayName(account.role)}
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
                        onClick={() => handleResetPassword(account.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAccounts.length > itemsPerPage && (
          <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Halaman {currentPage} dari {Math.ceil(filteredAccounts.length / itemsPerPage)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sebelumnya
                </button>
                
                {Array.from({ length: Math.ceil(filteredAccounts.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === Math.ceil(filteredAccounts.length / itemsPerPage) ||
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))
                }
                
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(filteredAccounts.length / itemsPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(filteredAccounts.length / itemsPerPage)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Import Akun dari CSV</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pilih File CSV</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded mb-4">
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Format CSV:</strong> nama,email,role
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Role yang valid:</strong> ADMIN, PEMOHON, PPID_UTAMA, PPID_PELAKSANA
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Password default:</strong> {defaultPassword}
                </p>
              </div>
              
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={isImporting}
                >
                  Batal
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isImporting ? 'Mengimpor...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Ubah Password Default</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Password Default Saat Ini</label>
                <input
                  type="text"
                  value={defaultPassword}
                  disabled
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Password Default Baru</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              
              <div className="bg-yellow-50 p-3 rounded mb-4">
                <p className="text-sm text-yellow-700">
                  Password ini akan digunakan untuk reset password dan pembuatan akun baru (manual atau import).
                </p>
              </div>
              
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdatePassword}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Berhasil</h3>
              <p className="text-gray-600 mb-6 text-center">{successMessage}</p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {confirmAction.type === 'delete' && 'Konfirmasi Hapus'}
                {confirmAction.type === 'reset' && 'Konfirmasi Reset Password'}
                {confirmAction.type === 'save' && 'Konfirmasi Simpan'}
                {confirmAction.type === 'bulk-delete' && 'Konfirmasi Hapus Massal'}
                {confirmAction.type === 'bulk-reset' && 'Konfirmasi Reset Password Massal'}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmAction.type === 'delete' && `Yakin ingin menghapus akun "${accounts.find(a => a.id === confirmAction.data)?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
                {confirmAction.type === 'reset' && `Yakin ingin reset password akun "${accounts.find(a => a.id === confirmAction.data)?.nama}" ke password default?`}
                {confirmAction.type === 'save' && `Yakin ingin ${editId ? 'memperbarui' : 'menyimpan'} akun ini?`}
                {confirmAction.type === 'bulk-delete' && `Yakin ingin menghapus ${Array.isArray(confirmAction.data) ? confirmAction.data.length : 0} akun yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
                {confirmAction.type === 'bulk-reset' && `Yakin ingin reset password ${Array.isArray(confirmAction.data) ? confirmAction.data.length : 0} akun yang dipilih ke password default?`}
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (confirmAction.type === 'delete') confirmDelete();
                    if (confirmAction.type === 'reset') confirmResetPassword();
                    if (confirmAction.type === 'save') confirmSave();
                    if (confirmAction.type === 'bulk-delete') confirmBulkDelete();
                    if (confirmAction.type === 'bulk-reset') confirmBulkResetPassword();
                  }}
                  className={`px-4 py-2 text-white rounded ${
                    confirmAction.type === 'delete' || confirmAction.type === 'bulk-delete' ? 'bg-red-600 hover:bg-red-700' :
                    confirmAction.type === 'reset' || confirmAction.type === 'bulk-reset' ? 'bg-yellow-600 hover:bg-yellow-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmAction.type === 'delete' && 'Hapus'}
                  {confirmAction.type === 'reset' && 'Reset'}
                  {confirmAction.type === 'save' && 'Simpan'}
                  {confirmAction.type === 'bulk-delete' && 'Hapus Semua'}
                  {confirmAction.type === 'bulk-reset' && 'Reset Semua'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}