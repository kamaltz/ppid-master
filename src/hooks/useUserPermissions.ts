import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserPermissions {
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

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const { token, user } = useAuth();
  const userRole = user?.role;

  useEffect(() => {
    if (!userRole || permissions) return;
    
    // Admin and PPID Utama get immediate full access
    if (userRole === 'ADMIN' || userRole === 'PPID_UTAMA' || userRole === 'PPID') {
      setPermissions({
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
      });
    } else if (userRole === 'PPID_PELAKSANA' || userRole === 'ATASAN_PPID') {
      setPermissions({
        informasi: true,
        kategori: true,
        chat: true,
        permohonan: true,
        keberatan: true,
        kelola_akun: false,
        manajemen_role: false,
        kelola_akses: false,
        log_aktivitas: true,
        pengaturan: false,
        media: false,
        profile: true,
        kelola_halaman: false
      });
    }
  }, [userRole, permissions]);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!userRole) return false;
    
    // Admin and PPID Utama always have permission
    if (userRole === 'ADMIN' || userRole === 'PPID_UTAMA' || userRole === 'PPID') return true;
    
    // Fallback permissions when database is unstable
    if (!permissions) {
      // Basic permissions for PPID roles when database is down
      if (userRole === 'PPID_PELAKSANA' || userRole === 'ATASAN_PPID') {
        const basicPermissions = ['permohonan', 'keberatan', 'chat', 'informasi', 'kategori', 'profile', 'log_aktivitas'];
        return basicPermissions.includes(permission);
      }
      
      // PPID Utama gets kelola_halaman permission even when database is down
      if ((userRole === 'PPID' || userRole === 'PPID_UTAMA') && permission === 'kelola_halaman') {
        return true;
      }
      return false;
    }
    
    return permissions[permission];
  };

  return { permissions, hasPermission };
};