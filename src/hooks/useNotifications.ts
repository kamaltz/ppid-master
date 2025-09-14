import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from './useDebounce';

interface NotificationCounts {
  pendingAccounts: number;
  newChats: number;
  newRequests: number;
  newObjections: number;
  newLogs: number;
  newMedia: number;
}

interface NotificationItem {
  id: string;
  status: 'unread' | 'read';
  role: string;
  timestamp: number;
}

interface NotificationHistory {
  pendingAccounts: NotificationItem[];
  newChats: NotificationItem[];
  newRequests: NotificationItem[];
  newObjections: NotificationItem[];
  newLogs: NotificationItem[];
  newMedia: NotificationItem[];
}

export const useNotifications = () => {
  const { getToken, getUserRole } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingAccounts: 0,
    newChats: 0,
    newRequests: 0,
    newObjections: 0,
    newLogs: 0,
    newMedia: 0
  });
  
  const getNotificationHistory = () => {
    const saved = localStorage.getItem('notificationHistory');
    return saved ? JSON.parse(saved) : {
      pendingAccounts: [],
      newChats: [],
      newRequests: [],
      newObjections: [],
      newLogs: [],
      newMedia: []
    };
  };

  const updateHistory = (type: keyof NotificationHistory, items: NotificationItem[]) => {
    const current = getNotificationHistory();
    const updated = { ...current, [type]: items };
    localStorage.setItem('notificationHistory', JSON.stringify(updated));
  };

  const markAsRead = (type: keyof NotificationHistory, id: string) => {
    const history = getNotificationHistory();
    const items = history[type].map((item: NotificationItem) => 
      item.id === id ? { ...item, status: 'read' as const } : item
    );
    updateHistory(type, items);
  };

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const role = getUserRole();
      
      // Batch all API calls to reduce resource usage
      const promises: Promise<any>[] = [];
      
      // Only fetch relevant data based on role
      if (role === 'ADMIN' || role === 'PPID_UTAMA') {
        // Admin and PPID Utama get pending accounts
        promises.push(
          fetch('/api/accounts/pending', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ type: 'pending', response: res })).catch(() => ({ type: 'pending', response: null }))
        );
        
        // Unassigned requests
        promises.push(
          fetch('/api/permintaan?status=Diajukan&unassigned=true', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ type: 'requests', response: res })).catch(() => ({ type: 'requests', response: null }))
        );
        
        // Unassigned objections
        promises.push(
          fetch('/api/keberatan?status=Diajukan&unassigned=true', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ type: 'objections', response: res })).catch(() => ({ type: 'objections', response: null }))
        );
      } else if (role === 'PPID_PELAKSANA') {
        // PPID Pelaksana gets assigned requests
        promises.push(
          fetch('/api/permintaan?status=Diteruskan', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ type: 'requests', response: res })).catch(() => ({ type: 'requests', response: null }))
        );
        
        // PPID Pelaksana gets all keberatan (assigned + unassigned forwarded)
        promises.push(
          fetch('/api/keberatan', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ type: 'objections', response: res })).catch(() => ({ type: 'objections', response: null }))
        );
      } else if (role === 'ATASAN_PPID') {
        // Atasan PPID gets assigned requests
        promises.push(
          fetch('/api/permintaan?assigned=true&status=Diteruskan', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ type: 'requests', response: res })).catch(() => ({ type: 'requests', response: null }))
        );
        
        promises.push(
          fetch('/api/keberatan?assigned=true&status=Diteruskan', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ type: 'objections', response: res })).catch(() => ({ type: 'objections', response: null }))
        );
      }
      
      // Chat notifications for all roles
      promises.push(
        fetch('/api/chat/unread', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => ({ type: 'chats', response: res })).catch(() => ({ type: 'chats', response: null }))
      );
      
      // PPID internal chats
      if (role && ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(role)) {
        promises.push(
          fetch('/api/ppid-chat/unread', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ type: 'ppid-chats', response: res })).catch(() => ({ type: 'ppid-chats', response: null }))
        );
      }
      
      // Execute all promises
      const results = await Promise.all(promises);
      
      // Process results
      let chatCount = 0;
      
      for (const result of results) {
        if (!result.response || !result.response.ok) continue;
        
        try {
          const data = await result.response.json();
          
          if (result.type === 'pending' && data.success && data.data) {
            const currentIds = data.data.map((item: any) => item.id.toString());
            const history = getNotificationHistory();
            
            const existingIds = history.pendingAccounts.map((item: NotificationItem) => item.id);
            const newItems = currentIds
              .filter((id: string) => !existingIds.includes(id))
              .map((id: string) => ({
                id,
                status: 'unread' as const,
                role: role || '',
                timestamp: Date.now()
              }));
            
            if (newItems.length > 0) {
              updateHistory('pendingAccounts', [...history.pendingAccounts, ...newItems]);
            }
            
            const updatedHistory = newItems.length > 0 ? [...history.pendingAccounts, ...newItems] : history.pendingAccounts;
            const unreadCount = updatedHistory
              .filter((item: NotificationItem) => 
                item.status === 'unread' && 
                currentIds.includes(item.id)
              ).length;
            
            setCounts(prev => ({ ...prev, pendingAccounts: unreadCount }));
          }
          
          if (result.type === 'requests' && data.success && data.data) {
            const currentIds = data.data.map((item: any) => item.id.toString());
            const history = getNotificationHistory();
            
            const existingIds = history.newRequests.map((item: NotificationItem) => item.id);
            const newItems = currentIds
              .filter((id: string) => !existingIds.includes(id))
              .map((id: string) => ({
                id,
                status: 'unread' as const,
                role: role || '',
                timestamp: Date.now()
              }));
            
            if (newItems.length > 0) {
              updateHistory('newRequests', [...history.newRequests, ...newItems]);
            }
            
            const updatedHistory = newItems.length > 0 ? [...history.newRequests, ...newItems] : history.newRequests;
            const unreadCount = updatedHistory
              .filter((item: NotificationItem) => 
                item.status === 'unread' && 
                currentIds.includes(item.id)
              ).length;
            
            setCounts(prev => ({ ...prev, newRequests: unreadCount }));
          }
          
          if (result.type === 'objections' && data.success && data.data) {
            const currentIds = data.data.map((item: any) => item.id.toString());
            const history = getNotificationHistory();
            
            const existingIds = history.newObjections.map((item: NotificationItem) => item.id);
            const newItems = currentIds
              .filter((id: string) => !existingIds.includes(id))
              .map((id: string) => ({
                id,
                status: 'unread' as const,
                role: role || '',
                timestamp: Date.now()
              }));
            
            if (newItems.length > 0) {
              updateHistory('newObjections', [...history.newObjections, ...newItems]);
            }
            
            const updatedHistory = newItems.length > 0 ? [...history.newObjections, ...newItems] : history.newObjections;
            const unreadCount = updatedHistory
              .filter((item: NotificationItem) => 
                item.status === 'unread' && 
                currentIds.includes(item.id)
              ).length;
            
            setCounts(prev => ({ ...prev, newObjections: unreadCount }));
          }
          
          if (result.type === 'chats' && data.success) {
            chatCount += data.count || 0;
          }
          
          if (result.type === 'ppid-chats' && data.success) {
            chatCount += data.count || 0;
          }
        } catch (parseError) {
          console.warn('Failed to parse response for', result.type);
        }
      }
      
      setCounts(prev => ({ ...prev, newChats: chatCount }));
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const clearNotification = (type: keyof NotificationCounts) => {
    const history = getNotificationHistory();
    
    if (type === 'pendingAccounts') {
      const updatedItems = history.pendingAccounts.map((item: NotificationItem) => 
        item.status === 'unread' ? { ...item, status: 'read' as const } : item
      );
      updateHistory('pendingAccounts', updatedItems);
    } else if (type === 'newRequests') {
      const updatedItems = history.newRequests.map((item: NotificationItem) => 
        item.status === 'unread' ? { ...item, status: 'read' as const } : item
      );
      updateHistory('newRequests', updatedItems);
    } else if (type === 'newObjections') {
      const updatedItems = history.newObjections.map((item: NotificationItem) => 
        item.status === 'unread' ? { ...item, status: 'read' as const } : item
      );
      updateHistory('newObjections', updatedItems);
    }
    
    setCounts(prev => ({ ...prev, [type]: 0 }));
  };

  const getDisplayCount = (type: keyof NotificationCounts, page: string) => {
    return counts[type];
  };

  // Debounce notification fetching to prevent resource exhaustion
  const { debouncedCallback: debouncedFetchNotifications } = useDebounce(fetchNotifications, 2000);
  
  const memoizedFetchNotifications = useCallback(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();
    if (token && role) {
      // Initial fetch
      memoizedFetchNotifications();
      
      // Reduced frequency - check every 2 minutes instead of 1
      const interval = setInterval(memoizedFetchNotifications, 120000);
      
      // Listen for notification refresh events with debouncing
      const handleNotificationRefresh = () => {
        console.log('Notification refresh triggered (debounced)');
        debouncedFetchNotifications();
      };
      
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'notification-refresh') {
          debouncedFetchNotifications();
        }
      };
      
      window.addEventListener('notification-refresh', handleNotificationRefresh);
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notification-refresh', handleNotificationRefresh);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [getToken, getUserRole, memoizedFetchNotifications, debouncedFetchNotifications]);

  // Add manual refresh function for immediate updates
  const refreshNotifications = useCallback(() => {
    debouncedFetchNotifications();
  }, [debouncedFetchNotifications]);

  return { counts, clearNotification, fetchNotifications, getDisplayCount, refreshNotifications };
};