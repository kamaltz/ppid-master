import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotificationStorage } from './useNotificationStorage';

interface NotificationCounts {
  pendingAccounts: number;
  newChats: number;
  newRequests: number;
  newObjections: number;
  newLogs: number;
  newMedia: number;
}

export const useNotifications = () => {
  const { getToken, getUserRole } = useAuth();
  const { markPageAsVisited, isPageVisited } = useNotificationStorage();
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingAccounts: 0,
    newChats: 0,
    newRequests: 0,
    newObjections: 0,
    newLogs: 0,
    newMedia: 0
  });

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const role = getUserRole();
      
      // Fetch different notifications based on role
      if (role === 'ADMIN' || role === 'PPID' || role === 'PPID_UTAMA') {
        // Fetch pending accounts
        try {
          const pendingResponse = await fetch('/api/accounts/pending', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            const pendingCount = pendingData.success ? (pendingData.data?.length || 0) : 0;

            setCounts(prev => ({ ...prev, pendingAccounts: pendingCount }));
          }
        } catch (error) {
          // Silent fail for pending accounts
        }

        // Fetch new requests
        const requestsResponse = await fetch('/api/permintaan?status=Diajukan', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setCounts(prev => ({ ...prev, newRequests: requestsData.data?.length || 0 }));
        }

        // Fetch new objections
        const objectionsResponse = await fetch('/api/keberatan?status=Diajukan', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (objectionsResponse.ok) {
          const objectionsData = await objectionsResponse.json();
          setCounts(prev => ({ ...prev, newObjections: objectionsData.data?.length || 0 }));
        }
      }

      // Fetch new chats for all roles
      const chatsResponse = await fetch('/api/chat/unread', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json();
        setCounts(prev => ({ ...prev, newChats: chatsData.count || 0 }));
      }

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const clearNotification = (type: keyof NotificationCounts, page?: string) => {
    setCounts(prev => ({ ...prev, [type]: 0 }));
  };

  const getDisplayCount = (type: keyof NotificationCounts, page: string) => {
    return counts[type];
  };

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();
    if (token && (role === 'ADMIN' || role === 'PPID' || role === 'PPID_UTAMA')) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Check every 1 minute
      return () => clearInterval(interval);
    }
  }, [getToken, getUserRole]);

  // Add manual refresh function for immediate updates
  const refreshNotifications = () => {
    fetchNotifications();
  };

  return { counts, clearNotification, fetchNotifications, getDisplayCount, refreshNotifications };
};