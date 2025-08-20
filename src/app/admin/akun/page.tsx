"use client";

import { useState, useEffect, useCallback } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES, getRoleDisplayName } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { Plus, Edit, Trash2, Key, Upload, Download } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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
          alert('Akun berhasil diperbarui');
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
          alert(`Akun berhasil dibuat dengan password default: Garut@2025?`);
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
        alert('Akun berhasil dihapus');
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
        alert('Password berhasil direset ke: Garut@2025?');
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
      
      alert(`${ids?.length || 0} akun berhasil dihapus`);
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
      
      alert(`Password ${ids?.length || 0} akun berhasil direset ke: Garut@2025?`);
      setSelectedAccounts([]);
    } catch (error) {
      console.error('Error bulk resetting passwords:', error);
      alert('Terjadi kesalahan saat reset password');
    }
    setShowConfirmModal(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccounts(accounts.map(account => account.id));
    } else {
      setSelectedAccounts([]);
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
        alert(data.message);
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
                    Password default: <strong>Garut@2025?</strong>
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
              {selectedAccounts.length} akun dipilih
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
                    checked={selectedAccounts.length === accounts.length && accounts.length > 0}
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
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Belum ada akun
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
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
                  <strong>Password default:</strong> Garut@2025?
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