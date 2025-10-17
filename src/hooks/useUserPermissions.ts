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
  const { token, user, getUserRole } = useAuth();
  const userRole = getUserRole();

  useEffect(() => {
    // Admin and PPID Utama get immediate full access
    if (userRole === 'ADMIN' || userRole === 'PPID_UTAMA' || userRole === 'PPID') {
      const fullPermissions: UserPermissions = {
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
      setPermissions(fullPermissions);
      return;
    }

    const fetchPermissions = async () => {
      if (!token || !user) return;

      try {
        const response = await fetch('/api/user/permissions', {
          headers: { Authorization: `Bearer ${token}` },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions);
        } else {
          console.warn('Permission API failed, using fallback permissions');
          // Set fallback permissions based on role
          setFallbackPermissions();
        }
      } catch (error) {
        console.error('Failed to fetch permissions, using fallback:', error);
        setFallbackPermissions();
      }
    };
    
    const setFallbackPermissions = () => {
      if (userRole === 'PPID' || userRole === 'PPID_PELAKSANA' || userRole === 'ATASAN_PPID') {
        const fallbackPermissions: UserPermissions = {
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
          kelola_halaman: (userRole === 'PPID' || userRole === 'PPID_UTAMA') // Only PPID Utama gets access
        };
        setPermissions(fallbackPermissions);
      }
    };

    fetchPermissions();
  }, [token, user, userRole]);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    // Admin and PPID Utama always have permission
    if (userRole === 'ADMIN' || userRole === 'PPID_UTAMA' || userRole === 'PPID') return true;
    
    // Fallback permissions when database is unstable
    if (!permissions) {
      // Basic permissions for PPID roles when database is down
      if (userRole === 'PPID_PELAKSANA' || userRole === 'ATASAN_PPID') {
        const basicPermissions = ['permohonan', 'keberatan', 'chat', 'informasi', 'kategori', 'profile'];
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