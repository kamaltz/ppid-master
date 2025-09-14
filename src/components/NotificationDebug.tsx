"use client";

import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';

export default function NotificationDebug() {
  const { counts, refreshNotifications } = useNotifications();
  const { getUserRole } = useAuth();
  const role = getUserRole();

  const clearStorage = () => {
    localStorage.removeItem('notificationHistory');
    refreshNotifications();
    alert('Notification storage cleared and refreshed');
  };

  if (role !== 'PPID_PELAKSANA') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold text-sm mb-2">Debug Notifikasi Keberatan</h3>
      <div className="text-sm space-y-1">
        <div>Role: {role}</div>
        <div>Keberatan Count: {counts.newObjections}</div>
        <div>Chat Count: {counts.newChats}</div>
        <div>Request Count: {counts.newRequests}</div>
      </div>
      <div className="mt-2 space-x-2">
        <button 
          onClick={refreshNotifications}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
        >
          Refresh
        </button>
        <button 
          onClick={clearStorage}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
}