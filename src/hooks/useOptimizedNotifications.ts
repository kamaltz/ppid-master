import { useState, useEffect, useCallback, useRef } from 'react';
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

export const useOptimizedNotifications = () => {
  const { getToken, getUserRole } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingAccounts: 0,
    newChats: 0,
    newRequests: 0,
    newObjections: 0,
    newLogs: 0,
    newMedia: 0
  });
  
  const lastFetchRef = useRef<number>(0);
  const isLoadingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const { debouncedCallback: debouncedFetch } = useDebounce(fetchNotifications, 5000);

  async function fetchNotifications() {
    // Rate limiting - minimum 5 seconds between calls
    const now = Date.now();
    if (now - lastFetchRef.current < 5000 || isLoadingRef.current) {
      return;
    }
    
    try {
      isLoadingRef.current = true;
      lastFetchRef.current = now;
      
      const token = getToken();
      const role = getUserRole();
      
      if (!token || !role) return;
      
      // Single optimized API call for chat notifications
      const chatResponse = await fetch('/api/chat/unread', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (chatResponse.ok && mountedRef.current) {
        const chatData = await chatResponse.json();
        setCounts(prev => ({ ...prev, newChats: chatData.count || 0 }));
      }
      
      // Role-specific requests (only if needed)
      if (role === 'PPID_PELAKSANA') {
        const requestsResponse = await fetch('/api/permintaan?status=Diteruskan&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });
        
        if (requestsResponse.ok && mountedRef.current) {
          const requestsData = await requestsResponse.json();
          setCounts(prev => ({ ...prev, newRequests: requestsData.pagination?.total || 0 }));
        }
      } else if (role === 'ADMIN' || role === 'PPID_UTAMA') {
        // Check for pending accounts
        const pendingResponse = await fetch('/api/accounts/pending?limit=1', {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });
        
        if (pendingResponse.ok && mountedRef.current) {
          const pendingData = await pendingResponse.json();
          setCounts(prev => ({ ...prev, pendingAccounts: pendingData.data?.length || 0 }));
        }
        
        // Check for new requests (Diajukan status - new requests)
        const newRequestsResponse = await fetch('/api/permintaan?status=Diajukan&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });
        
        if (newRequestsResponse.ok && mountedRef.current) {
          const newRequestsData = await newRequestsResponse.json();
          setCounts(prev => ({ ...prev, newRequests: newRequestsData.pagination?.total || 0 }));
        }
        
        // Check for new objections (Diajukan status - new objections)
        const newObjectionsResponse = await fetch('/api/keberatan?status=Diajukan&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });
        
        if (newObjectionsResponse.ok && mountedRef.current) {
          const newObjectionsData = await newObjectionsResponse.json();
          setCounts(prev => ({ ...prev, newObjections: newObjectionsData.pagination?.total || 0 }));
        }
      }
      
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.warn('Notification fetch failed:', error?.message);
      }
    } finally {
      isLoadingRef.current = false;
    }
  }

  const clearNotification = (type: keyof NotificationCounts) => {
    setCounts(prev => ({ ...prev, [type]: 0 }));
  };

  const getDisplayCount = (type: keyof NotificationCounts) => {
    return counts[type];
  };

  const refreshNotifications = useCallback(() => {
    debouncedFetch();
  }, [debouncedFetch]);

  useEffect(() => {
    mountedRef.current = true;
    const token = getToken();
    const role = getUserRole();
    
    if (token && role && mountedRef.current) {
      // Initial fetch
      fetchNotifications();
      
      // Different intervals based on role
      const interval = role === 'Pemohon' 
        ? setInterval(() => {
            if (mountedRef.current) fetchNotifications();
          }, 30000)  // 30 seconds for Pemohon
        : setInterval(() => {
            if (mountedRef.current) fetchNotifications();
          }, 30000); // 30 seconds for Admin/PPID to catch new requests faster
      
      return () => {
        mountedRef.current = false;
        clearInterval(interval);
      };
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return { counts, clearNotification, getDisplayCount, refreshNotifications };
};