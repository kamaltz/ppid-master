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
    keberatan: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch all users in one call
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
      
      if (data.success) {
        alert("Permissions berhasil diupdate!");
        fetchUsers();
        setSelectedUser(null);
      } else {
        alert(data.error || "Gagal update permissions");
      }
    } catch (error) {
      console.error("Failed to update permissions:", error);
      alert("Terjadi kesalahan saat update permissions");
    }
  };

  const openPermissionModal = (user: User) => {
    setSelectedUser(user);
    try {
      const userPermissions = user.permissions ? JSON.parse(user.permissions) : {
        informasi: false,
        kategori: false,
        chat: false,
        permohonan: false,
        keberatan: false
      };
      setPermissions(userPermissions);
    } catch {
      setPermissions({
        informasi: false,
        kategori: false,
        chat: false,
        permohonan: false,
        keberatan: false
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    // Auto refresh every 30 seconds for real-time data
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
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
          <h1 className="text-3xl font-bold text-gray-800">Kelola Akses Role</h1>
          <p className="text-gray-600 mt-2">Kelola akses untuk PPID Utama, PPID Pelaksana, dan Atasan PPID</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredUsers.length} pengguna PPID
        </div>
      </div>

      {/* Filters */}
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
              <option value="all">Semua Role</option>
              <option value="PPID_UTAMA">PPID Utama</option>
              <option value="PPID_PELAKSANA">PPID Pelaksana</option>
              <option value="ATASAN_PPID">Atasan PPID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat pengguna PPID...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Tidak ada pengguna PPID ditemukan</p>
            <p className="text-sm mt-2">Hanya menampilkan PPID Utama, PPID Pelaksana, dan Atasan PPID</p>
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
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
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

      {/* Permission Modal */}
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
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Akses Informasi</label>
                <input
                  type="checkbox"
                  checked={permissions.informasi}
                  onChange={(e) => setPermissions({...permissions, informasi: e.target.checked})}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Akses Kategori</label>
                <input
                  type="checkbox"
                  checked={permissions.kategori}
                  onChange={(e) => setPermissions({...permissions, kategori: e.target.checked})}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Akses Chat</label>
                <input
                  type="checkbox"
                  checked={permissions.chat}
                  onChange={(e) => setPermissions({...permissions, chat: e.target.checked})}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Akses Permohonan</label>
                <input
                  type="checkbox"
                  checked={permissions.permohonan}
                  onChange={(e) => setPermissions({...permissions, permohonan: e.target.checked})}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Akses Keberatan</label>
                <input
                  type="checkbox"
                  checked={permissions.keberatan}
                  onChange={(e) => setPermissions({...permissions, keberatan: e.target.checked})}
                  className="rounded"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Batal
              </button>
              <button 
                onClick={() => updatePermissions(selectedUser.id, permissions)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}