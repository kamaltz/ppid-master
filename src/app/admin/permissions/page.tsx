"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Shield, Users } from "lucide-react";

interface User {
  id: number;
  email: string;
  nama: string;
  role: string;
  permissions?: string;
}

interface Permission {
  informasi: boolean;
  kategori: boolean;
  chat: boolean;
  permohonan: boolean;
  keberatan: boolean;
  kelola_akun: boolean;
  manajemen_role: boolean;
  kelola_akses: boolean;
  log_aktivitas: boolean;
  pengaturan: boolean;
  media: boolean;
  profile: boolean;
  kelola_halaman: boolean;
}

export default function PermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission>({
    informasi: false,
    kategori: false,
    chat: false,
    permohonan: false,
    keberatan: false,
    kelola_akun: false,
    manajemen_role: false,
    kelola_akses: false,
    log_aktivitas: false,
    pengaturan: false,
    media: false,
    profile: false,
    kelola_halaman: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/users', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updatePermissions = async (userId: number, newPermissions: Permission) => {
    try {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, permissions: JSON.stringify(newPermissions) }
            : user
        )
      );

      const response = await fetch("/api/admin/role-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          permissions: newPermissions
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        fetchUsers();
        alert(data.error || "Gagal update permissions");
      }
    } catch (error) {
      console.error("Failed to update permissions:", error);
      fetchUsers();
      alert("Terjadi kesalahan saat update permissions");
    }
  };

  const getDefaultPermissions = (role: string): Permission => {
    switch (role) {
      case 'ADMIN':
        return {
          informasi: true,
          kategori: true,
          chat: true,
          permohonan: true,
          keberatan: true,
          kelola_akun: true,
          manajemen_role: true,
          kelola_akses: true,
          log_aktivitas: true,
          pengaturan: true,
          media: true,
          profile: true,
          kelola_halaman: true
        };
      case 'PPID_UTAMA':
        return {
          informasi: true,
          kategori: true,
          chat: true,
          permohonan: true,
          keberatan: true,
          kelola_akun: false,
          manajemen_role: false,
          kelola_akses: false,
          log_aktivitas: false,
          pengaturan: true,
          media: true,
          profile: true,
          kelola_halaman: true
        };
      case 'PPID_PELAKSANA':
        return {
          informasi: true,
          kategori: true,
          chat: true,
          permohonan: true,
          keberatan: true,
          kelola_akun: false,
          manajemen_role: false,
          kelola_akses: false,
          log_aktivitas: false,
          pengaturan: false,
          media: false,
          profile: true,
          kelola_halaman: false
        };
      case 'ATASAN_PPID':
        return {
          informasi: true,
          kategori: false,
          chat: false,
          permohonan: true,
          keberatan: true,
          kelola_akun: false,
          manajemen_role: false,
          kelola_akses: false,
          log_aktivitas: false,
          pengaturan: false,
          media: false,
          profile: true,
          kelola_halaman: false
        };
      default:
        return {
          informasi: false,
          kategori: false,
          chat: false,
          permohonan: false,
          keberatan: false,
          kelola_akun: false,
          manajemen_role: false,
          kelola_akses: false,
          log_aktivitas: false,
          pengaturan: false,
          media: false,
          profile: false,
          kelola_halaman: false
        };
    }
  };

  const openPermissionModal = (user: User) => {
    setSelectedUser(user);
    try {
      const defaultPerms = getDefaultPermissions(user.role);
      const userPermissions = user.permissions ? JSON.parse(user.permissions) : defaultPerms;
      // Ensure all permission keys exist with boolean values
      const completePermissions = {
        ...defaultPerms,
        ...userPermissions
      };
      setPermissions(completePermissions);
    } catch {
      setPermissions(getDefaultPermissions(user.role));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const getRoleColor = useCallback((role: string) => {
    const colors = {
      'PPID_UTAMA': 'bg-blue-100 text-blue-800',
      'PPID_PELAKSANA': 'bg-green-100 text-green-800',
      'ATASAN_PPID': 'bg-purple-100 text-purple-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }, []);

  const getRoleDisplayName = useCallback((role: string) => {
    const displayNames = {
      'PPID_UTAMA': 'PPID Utama',
      'PPID_PELAKSANA': 'PPID Pelaksana', 
      'ATASAN_PPID': 'Atasan PPID'
    };
    return displayNames[role as keyof typeof displayNames] || role;
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Akses PPID</h1>
          <p className="text-gray-600 mt-2">Kelola akses untuk semua akun PPID yang terdaftar</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredUsers.length} akun PPID
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">Semua Role PPID</option>
              <option value="PPID_UTAMA">PPID Utama</option>
              <option value="PPID_PELAKSANA">PPID Pelaksana</option>
              <option value="ATASAN_PPID">Atasan PPID</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat pengguna PPID...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Tidak ada pengguna PPID ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{user.nama}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                        {(() => {
                          try {
                            const userPerms = user.permissions ? JSON.parse(user.permissions) : {};
                            const activePerms = Object.entries(userPerms).filter(([, value]) => value).length;
                            return activePerms > 0 ? (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                {activePerms} akses aktif
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Tidak ada akses
                              </span>
                            );
                          } catch {
                            return (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Tidak ada akses
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPermissionModal(user)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Shield className="w-4 h-4" />
                      Kelola Akses
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kelola Akses - {selectedUser.nama}</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'informasi', label: 'Akses Informasi' },
                  { key: 'kategori', label: 'Akses Kategori' },
                  { key: 'chat', label: 'Akses Chat' },
                  { key: 'permohonan', label: 'Akses Permohonan' },
                  { key: 'keberatan', label: 'Akses Keberatan' },
                  { key: 'kelola_akun', label: 'Kelola Akun' },
                  { key: 'manajemen_role', label: 'Manajemen Role' },
                  { key: 'kelola_akses', label: 'Kelola Akses' },
                  { key: 'kelola_halaman', label: 'Kelola Halaman' },
                  { key: 'log_aktivitas', label: 'Log Aktivitas' },
                  { key: 'pengaturan', label: 'Pengaturan' },
                  { key: 'media', label: 'Media' },
                  { key: 'profile', label: 'Profile' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <label className="text-sm font-medium">{label}</label>
                    <input
                      type="checkbox"
                      checked={Boolean(permissions[key as keyof Permission])}
                      onChange={(e) => {
                        const newPermissions = {...permissions, [key]: e.target.checked};
                        setPermissions(newPermissions);
                        updatePermissions(selectedUser.id, newPermissions);
                      }}
                      className="rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  const defaultPerms = getDefaultPermissions(selectedUser.role);
                  setPermissions(defaultPerms);
                  updatePermissions(selectedUser.id, defaultPerms);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Reset ke Default
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}