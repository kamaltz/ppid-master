"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Shield, Users, Settings } from "lucide-react";

interface RoleStats {
  role: string;
  count: number;
  permissions: string[];
}

export default function RoleManagementPage() {
  const [roleStats, setRoleStats] = useState<RoleStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchRoleStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/role-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setRoleStats(data.data);
      } else {
        throw new Error(data.error || 'API request failed');
      }
    } catch (error) {
      console.error("Failed to fetch role stats:", error);
      setRoleStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoleStats();
  }, [fetchRoleStats]);

  const getRoleColor = (role: string) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-800 border-red-200',
      'PPID_UTAMA': 'bg-blue-100 text-blue-800 border-blue-200',
      'PPID_PELAKSANA': 'bg-green-100 text-green-800 border-green-200',
      'ATASAN_PPID': 'bg-purple-100 text-purple-800 border-purple-200',
      'Pemohon': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleDisplayName = (role: string) => {
    const displayNames = {
      'ADMIN': 'Administrator',
      'PPID_UTAMA': 'PPID Utama',
      'PPID_PELAKSANA': 'PPID Pelaksana',
      'ATASAN_PPID': 'Atasan PPID',
      'Pemohon': 'Pemohon'
    };
    return displayNames[role as keyof typeof displayNames] || role;
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      'ADMIN': 'Akses penuh ke semua fitur sistem',
      'PPID_UTAMA': 'Mengelola informasi publik dan permohonan',
      'PPID_PELAKSANA': 'Memproses permohonan informasi',
      'ATASAN_PPID': 'Menyetujui dan mengawasi proses',
      'Pemohon': 'Mengajukan permohonan informasi'
    };
    return descriptions[role as keyof typeof descriptions] || 'Tidak ada deskripsi';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Role</h1>
          <p className="text-gray-600 mt-2">Overview dan statistik role pengguna sistem</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/permissions"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Kelola Permissions
          </Link>
          <Link
            href="/admin/akun"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Kelola Akun
          </Link>
        </div>
      </div>

      {/* Role Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Memuat statistik role...
          </div>
        ) : roleStats.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Tidak ada data role ditemukan
          </div>
        ) : (
          roleStats.map((stat) => (
            <div key={stat.role} className={`bg-white rounded-lg shadow-md border-l-4 ${getRoleColor(stat.role)} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getRoleDisplayName(stat.role)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {stat.count} pengguna
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(stat.role)}`}>
                  {stat.count}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {getRoleDescription(stat.role)}
              </p>
              
              {stat.permissions && stat.permissions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Permissions Aktif
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {stat.permissions.slice(0, 3).map((permission, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {permission}
                      </span>
                    ))}
                    {stat.permissions.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{stat.permissions.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Role Hierarchy */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Hierarki Role</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <Shield className="w-6 h-6 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Administrator</h3>
              <p className="text-sm text-red-600">Level tertinggi - Akses penuh ke semua fitur</p>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">Level 1</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800">PPID Utama</h3>
              <p className="text-sm text-blue-600">Mengelola informasi publik dan koordinasi PPID</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Level 2</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Shield className="w-6 h-6 text-purple-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-800">Atasan PPID</h3>
              <p className="text-sm text-purple-600">Menyetujui dan mengawasi proses permohonan</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Level 3</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <Shield className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">PPID Pelaksana</h3>
              <p className="text-sm text-green-600">Memproses permohonan informasi harian</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Level 4</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">Pemohon</h3>
              <p className="text-sm text-gray-600">Mengajukan permohonan informasi publik</p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">Level 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}