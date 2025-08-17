"use client";

import React, { useState, useEffect } from 'react';
import { ROLES } from '@/lib/roleUtils';
import RoleGuard from '@/components/auth/RoleGuard';

interface PPID {
  id: number;
  nama: string;
  email: string;
}

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  sender: { nama: string };
}

export default function ChatPpidPage() {
  const [ppidList, setPpidList] = useState<PPID[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPpid, setSelectedPpid] = useState<PPID | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchPpidList = async (search = '', page = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = `/api/admin/assign-ppid?search=${encodeURIComponent(search)}&page=${page}&limit=10`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (page === 1) {
          setPpidList(data.data);
        } else {
          setPpidList(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch PPID list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPpidList(searchTerm, currentPage + 1);
    }
  };

  const fetchMessages = async (ppidId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/chat-ppid/${ppidId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPpid || sending) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/chat-ppid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: selectedPpid.id,
          message: newMessage.trim()
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedPpid.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };



  useEffect(() => {
    // Auto-select PPID from URL parameter after ppidList is loaded
    const urlParams = new URLSearchParams(window.location.search);
    const ppidId = urlParams.get('ppid');
    if (ppidId && ppidList.length > 0) {
      const ppid = ppidList.find(p => p.id === parseInt(ppidId));
      if (ppid) {
        setSelectedPpid(ppid);
      }
    }
  }, [ppidList]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setPpidList([]);
      fetchPpidList(searchTerm, 1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedPpid) {
      fetchMessages(selectedPpid.id);
      const interval = setInterval(() => fetchMessages(selectedPpid.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedPpid]);

  return (
    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA]}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Chat dengan PPID</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* PPID List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Pilih PPID</h3>
              <input
                type="text"
                placeholder="Cari PPID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div 
              className="overflow-y-auto h-[500px]"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
                  loadMore();
                }
              }}
            >
              {ppidList.map((ppid) => (
                <button
                  key={ppid.id}
                  onClick={() => setSelectedPpid(ppid)}
                  className={`w-full p-4 text-left border-b hover:bg-gray-50 ${
                    selectedPpid?.id === ppid.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="font-medium">{ppid.nama}</div>
                  <div className="text-sm text-gray-500">{ppid.email}</div>
                </button>
              ))}
              {loading && (
                <div className="text-center py-4">
                  <span className="text-gray-500">Loading...</span>
                </div>
              )}
              {!hasMore && ppidList.length > 0 && (
                <div className="text-center py-4">
                  <span className="text-gray-400 text-sm">Semua PPID telah dimuat</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
            {selectedPpid ? (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Chat dengan {selectedPpid.nama}</h3>
                  <p className="text-sm text-gray-500">{selectedPpid.email}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-600">
                          {msg.sender.nama}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tulis pesan..."
                      className="flex-1 border rounded-lg px-3 py-2"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sending ? 'Kirim...' : 'Kirim'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Pilih PPID untuk memulai chat
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}