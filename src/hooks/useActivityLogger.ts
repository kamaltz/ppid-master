import { useAuth } from '@/context/AuthContext';
import { useCallback } from 'react';

export const useActivityLogger = () => {
  const { getUserRole, getUserName, getUserId } = useAuth();

  const logActivity = useCallback(async (
    action: string,
    message: string,
    level: string = 'INFO',
    details?: Record<string, unknown>
  ) => {
    try {
      const userId = getUserId();
      const userRole = getUserRole();
      const userName = getUserName();
      
      console.log('Logging activity for user:', { userId, userRole, userName });
      
      const userData = {
        user_id: userId,
        user_role: userRole,
        user_email: userName,
        action,
        level,
        message,
        details
      };

      const response = await fetch('/api/logs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        console.log('Activity logged successfully');
      } else {
        console.error('Failed to log activity:', response.status);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [getUserRole, getUserName, getUserId]);

  const logLogin = useCallback(() => {
    logActivity('LOGIN', `${getUserRole()} login: ${getUserName()}`, 'SUCCESS');
  }, [logActivity, getUserRole, getUserName]);

  const logLogout = useCallback(() => {
    logActivity('LOGOUT', `${getUserRole()} logout: ${getUserName()}`);
  }, [logActivity, getUserRole, getUserName]);

  const logInformasiCreate = useCallback((title: string) => {
    logActivity('CREATE_INFORMASI', `Membuat informasi: ${title}`, 'SUCCESS');
  }, [logActivity]);

  const logInformasiUpdate = useCallback((title: string) => {
    logActivity('UPDATE_INFORMASI', `Mengupdate informasi: ${title}`, 'SUCCESS');
  }, [logActivity]);

  const logInformasiDelete = useCallback((title: string) => {
    logActivity('DELETE_INFORMASI', `Menghapus informasi: ${title}`, 'WARN');
  }, [logActivity]);

  return {
    logActivity,
    logLogin,
    logLogout,
    logInformasiCreate,
    logInformasiUpdate,
    logInformasiDelete
  };
};