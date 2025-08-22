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
}

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const { token, user, getUserRole } = useAuth();
  const userRole = getUserRole();

  useEffect(() => {
    // Admin gets immediate full access
    if (userRole === 'Admin') {
      const adminPermissions: UserPermissions = {
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
        profile: true
      };
      setPermissions(adminPermissions);
      return;
    }

    const fetchPermissions = async () => {
      if (!token || !user) return;

      try {
        const response = await fetch('/api/user/permissions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions);
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    };

    fetchPermissions();
  }, [token, user, userRole]);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    // Admin always has permission
    if (userRole === 'Admin') return true;
    if (!permissions) return false;
    return permissions[permission];
  };

  return { permissions, hasPermission };
};