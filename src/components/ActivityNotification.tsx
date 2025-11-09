"use client";

import { useState, useEffect, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ActivityLog {
  id: number;
  action: string;
  details: string;
  user_role: string;
  created_at: string;
}

export default function ActivityNotification() {
  const { getUserRole } = useAuth();
  const [notifications, setNotifications] = useState<ActivityLog[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastLogId, setLastLogId] = useState<number>(0);
  const [newCount, setNewCount] = useState(0);

  const fetchNewActivities = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/activity-logs?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        const latestId = data.data[0].id;
        
        if (lastLogId > 0 && latestId > lastLogId) {
          const newLogs = data.data.filter((log: ActivityLog) => log.id > lastLogId);
          setNewCount(prev => prev + newLogs.length);
        }
        
        setLastLogId(latestId);
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  }, [lastLogId]);

  useEffect(() => {
    // Only show for PPID roles
    const allowedRoles = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'];
    if (!allowedRoles.includes(getUserRole())) return;

    // Initial load
    fetchNewActivities();

    // Poll for new activities every 30 seconds
    const interval = setInterval(fetchNewActivities, 30000);
    return () => clearInterval(interval);
  }, [fetchNewActivities, getUserRole]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} jam lalu`;
    return date.toLocaleDateString('id-ID');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return '🔐';
      case 'LOGOUT': return '🚪';
      case 'CREATE_INFORMASI': return '📝';
      case 'UPDATE_INFORMASI': return '✏️';
      case 'DELETE_INFORMASI': return '🗑️';
      default: return '📋';
    }
  };

  const allowedRoles = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'];
  if (!allowedRoles.includes(getUserRole())) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) setNewCount(0);
        }}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Aktivitas Terbaru"
      >
        <Bell className="w-5 h-5" />
        {newCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {newCount > 9 ? '9+' : newCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Aktivitas Terbaru</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Belum ada aktivitas terbaru
              </div>
            ) : (
              notifications.map((activity) => (
                <div key={activity.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getActionIcon(activity.action)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium">
                        {activity.details}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {activity.user_role}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('auth_token');
                  const response = await fetch('/api/activity-logs?limit=20', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const data = await response.json();
                  if (data.success) {
                    setNotifications(data.data);
                  }
                } catch (error) {
                  console.error('Failed to load more activities:', error);
                }
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Muat Lebih Banyak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}