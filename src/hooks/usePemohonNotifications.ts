import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export const usePemohonNotifications = () => {
  const [chatCount, setChatCount] = useState(0);
  const { getToken, getUserRole } = useAuth();

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      const role = getUserRole();
      
      console.log('[usePemohonNotifications] Fetching for role:', role);
      
      if (!token || role !== 'Pemohon') {
        console.log('[usePemohonNotifications] No token or not Pemohon role');
        return;
      }
      
      const response = await fetch('/api/chat/unread', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('[usePemohonNotifications] API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[usePemohonNotifications] API data:', data);
        console.log('[usePemohonNotifications] Setting chatCount to:', data.count || 0);
        setChatCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    const role = getUserRole();
    console.log('[usePemohonNotifications] useEffect triggered, role:', role);
    if (role === 'Pemohon') {
      console.log('[usePemohonNotifications] Starting notification system');
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30 seconds
      return () => {
        console.log('[usePemohonNotifications] Cleanup');
        clearInterval(interval);
      };
    }
  }, []);

  const clearNotifications = () => setChatCount(0);
  const refreshNotifications = () => fetchNotifications();

  return { chatCount, clearNotifications, refreshNotifications };
};