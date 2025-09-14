import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export const usePemohonNotifications = () => {
  const [chatCount, setChatCount] = useState(0);
  const { getToken, getUserRole } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      const token = getToken();
      const role = getUserRole();
      
      console.log('[usePemohonNotifications] Fetching for role:', role, 'token exists:', !!token);
      
      if (!token || (role !== 'Pemohon' && role !== 'PEMOHON')) {
        console.log('[usePemohonNotifications] Skipping fetch - token:', !!token, 'role:', role);
        setChatCount(0); // Reset count if not valid
        return;
      }
      
      console.log('[usePemohonNotifications] Making API call to /api/chat/unread');
      
      const response = await fetch('/api/chat/unread', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[usePemohonNotifications] API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[usePemohonNotifications] API response data:', data);
        const newCount = data.count || 0;
        console.log('[usePemohonNotifications] Setting chatCount from', chatCount, 'to', newCount);
        setChatCount(newCount);
      } else {
        const errorText = await response.text();
        console.error('[usePemohonNotifications] API error:', response.status, errorText);
        setChatCount(0); // Reset on error
      }
    } catch (error) {
      console.error('[usePemohonNotifications] Fetch error:', error);
      setChatCount(0); // Reset on error
    }
  }, [getToken, getUserRole]); // Add dependencies

  useEffect(() => {
    const role = getUserRole();
    const token = getToken();
    console.log('[usePemohonNotifications] useEffect triggered, role:', role, 'token:', !!token);
    
    if (token && (role === 'Pemohon' || role === 'PEMOHON')) {
      console.log('[usePemohonNotifications] Starting notification system');
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30 seconds
      return () => {
        console.log('[usePemohonNotifications] Cleanup');
        clearInterval(interval);
      };
    } else {
      console.log('[usePemohonNotifications] Not starting - token:', !!token, 'role:', role);
      setChatCount(0); // Reset count if conditions not met
    }
  }, [fetchNotifications]); // Use fetchNotifications as dependency

  const clearNotifications = useCallback(() => {
    console.log('[usePemohonNotifications] Clearing notifications');
    setChatCount(0);
  }, []);
  
  const refreshNotifications = useCallback(() => {
    console.log('[usePemohonNotifications] Manual refresh triggered');
    fetchNotifications();
  }, [fetchNotifications]);

  return { chatCount, clearNotifications, refreshNotifications };
};