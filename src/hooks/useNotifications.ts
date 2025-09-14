import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

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
      
      // Fetch different notifications based on role
      if (role === 'ADMIN' || role === 'PPID_UTAMA' || role === 'PPID_PELAKSANA' || role === 'ATASAN_PPID') {
        // Fetch pending accounts
        try {
          console.log('Fetching pending accounts for role:', role);
          const pendingResponse = await fetch('/api/accounts/pending', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Pending response status:', pendingResponse.status);
          if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            console.log('Pending data:', pendingData);
            if (pendingData.success && pendingData.data) {
              const currentIds = pendingData.data.map((item: any) => item.id.toString());
              const history = getNotificationHistory();
              const role = getUserRole();
              
              // Add new items to history
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
              
              // Count unread items for current role
              const updatedHistory = newItems.length > 0 ? [...history.pendingAccounts, ...newItems] : history.pendingAccounts;
              const unreadCount = updatedHistory
                .filter((item: NotificationItem) => 
                  item.status === 'unread' && 
                  currentIds.includes(item.id)
                ).length;
              
              console.log('Setting pending accounts count:', unreadCount);
              setCounts(prev => ({ ...prev, pendingAccounts: unreadCount }));
            }
          }
        } catch (error) {
          // Silent fail for pending accounts
        }

        // Fetch new requests with history tracking
        try {
          let requestsUrl = '/api/permintaan?status=Diajukan';
          if (role === 'PPID_PELAKSANA') {
            // For PPID Pelaksana, show forwarded requests (both assigned and unassigned)
            requestsUrl = '/api/permintaan?status=Diteruskan';
          } else if (role === 'ATASAN_PPID') {
            requestsUrl = '/api/permintaan?assigned=true&status=Diteruskan';
          } else {
            requestsUrl = '/api/permintaan?unassigned=true&status=Diajukan';
          }
          
          const requestsResponse = await fetch(requestsUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json();
            if (requestsData.success && requestsData.data) {
              const currentIds = requestsData.data.map((item: any) => item.id.toString());
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
          }
        } catch (error) {
          // Silent fail
        }

        // Fetch new objections with history tracking
        try {
          let objectionsUrl = '/api/keberatan?status=Diajukan';
          if (role === 'PPID_PELAKSANA') {
            objectionsUrl = '/api/keberatan?status=Diteruskan';
          } else if (role === 'ATASAN_PPID') {
            objectionsUrl = '/api/keberatan?assigned=true&status=Diteruskan';
          } else {
            objectionsUrl = '/api/keberatan?unassigned=true&status=Diajukan';
          }
          
          const objectionsResponse = await fetch(objectionsUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (objectionsResponse.ok) {
            const objectionsData = await objectionsResponse.json();
            if (objectionsData.success && objectionsData.data) {
              const currentIds = objectionsData.data.map((item: any) => item.id.toString());
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
          }
        } catch (error) {
          // Silent fail
        }
      }

      // Fetch new chats for all roles
      try {
        const [pemohonChatsResponse, ppidChatsResponse] = await Promise.all([
          fetch('/api/chat/unread', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/ppid-chat/unread', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        let totalUnread = 0;
        
        if (pemohonChatsResponse.ok) {
          const data = await pemohonChatsResponse.json();
          totalUnread += data.count || 0;
        }
        
        if (ppidChatsResponse.ok) {
          const data = await ppidChatsResponse.json();
          totalUnread += data.count || 0;
        }
        
        setCounts(prev => ({ ...prev, newChats: totalUnread }));
      } catch (error) {
        // Silent fail for chats
      }

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

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();
    if (token && role) {
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