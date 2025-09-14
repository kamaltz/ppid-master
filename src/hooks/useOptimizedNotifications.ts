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
      
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        setCounts(prev => ({ ...prev, newChats: chatData.count || 0 }));
      }
      
      // Role-specific requests (only if needed)
      if (role === 'PPID_PELAKSANA') {
        const requestsResponse = await fetch('/api/permintaan?status=Diteruskan&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });
        
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setCounts(prev => ({ ...prev, newRequests: requestsData.pagination?.total || 0 }));
        }
      } else if (role === 'ADMIN' || role === 'PPID_UTAMA') {
        // Check for pending accounts
        const pendingResponse = await fetch('/api/accounts/pending?limit=1', {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });
        
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setCounts(prev => ({ ...prev, pendingAccounts: pendingData.data?.length || 0 }));
        }
        
        // Check for new requests (Diajukan status - new requests)
        const newRequestsResponse = await fetch('/api/permintaan?status=Diajukan&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });
        
        if (newRequestsResponse.ok) {
          const newRequestsData = await newRequestsResponse.json();
          setCounts(prev => ({ ...prev, newRequests: newRequestsData.pagination?.total || 0 }));
        }
        
        // Check for new objections (Diajukan status - new objections)
        const newObjectionsResponse = await fetch('/api/keberatan?status=Diajukan&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });
        
        if (newObjectionsResponse.ok) {
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
    const token = getToken();
    const role = getUserRole();
    
    if (token && role) {
      // Initial fetch
      fetchNotifications();
      
      // Different intervals based on role
      const interval = role === 'Pemohon' 
        ? setInterval(fetchNotifications, 30000)  // 30 seconds for Pemohon
        : setInterval(fetchNotifications, 30000); // 30 seconds for Admin/PPID to catch new requests faster
      
      return () => clearInterval(interval);
    }
  }, []);

  return { counts, clearNotification, getDisplayCount, refreshNotifications };
};