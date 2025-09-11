"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ChatItem {
  id: number;
  type: 'request' | 'keberatan';
  title: string;
  subtitle: string;
  status: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageFrom: string;
  url: string;
}

export default function PemohonChatListPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'request' | 'keberatan'>('all');
  const [newlyCreated, setNewlyCreated] = useState<Set<string>>(new Set());

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/chat-list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChats(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 30000);
    
    // Listen for new request/keberatan creation
    const handleNewRequest = () => {
      setTimeout(() => {
        fetchChats();
        // Mark as newly created for 10 seconds
        setTimeout(() => setNewlyCreated(new Set()), 10000);
      }, 1000);
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'new-request-created' || e.key === 'new-keberatan-created') {
        fetchChats();
        localStorage.removeItem(e.key);
        // Add visual indicator for new items
        setNewlyCreated(new Set(['latest']));
        setTimeout(() => setNewlyCreated(new Set()), 5000);
      }
    };
    
    window.addEventListener('request-created', handleNewRequest);
    window.addEventListener('keberatan-created', handleNewRequest);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('request-created', handleNewRequest);
      window.removeEventListener('keberatan-created', handleNewRequest);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredChats = chats.filter(chat => {
    if (filter === 'all') return true;
    return chat.type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diajukan': return 'bg-yellow-100 text-yellow-800';
      case 'Diteruskan': return 'bg-blue-100 text-blue-800';
      case 'Diproses': return 'bg-blue-100 text-blue-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Ditolak': return 'bg-red-100 text-red-800';
      case 'Ditanggapi': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Baru saja';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam lalu`;
    } else {
      return date.toLocaleDateString('id-ID');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">💬 Chat Saya</h1>
        <p className="text-gray-600">Percakapan dengan petugas PPID</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Semua ({chats.length})
            </button>
            <button
              onClick={() => setFilter('request')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'request'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Permohonan ({chats.filter(c => c.type === 'request').length})
            </button>
            <button
              onClick={() => setFilter('keberatan')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'keberatan'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Keberatan ({chats.filter(c => c.type === 'keberatan').length})
            </button>
          </nav>
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat chat...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada chat</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Anda belum memiliki percakapan dengan PPID'
                : `Belum ada chat ${filter === 'request' ? 'permohonan' : 'keberatan'}`
              }
            </p>
            <div className="space-y-2">
              <Link 
                href="/pemohon/ajukan"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                Buat Permohonan Baru
              </Link>
              <Link 
                href="/pemohon/keberatan"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Ajukan Keberatan
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat, index) => {
              const isNew = index === 0 && newlyCreated.has('latest');
              return (
                <Link key={`${chat.type}-${chat.id}`} href={chat.url}>
                  <div className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                    isNew ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}>
                    {isNew && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          Baru
                        </span>
                      </div>
                    )}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        chat.type === 'request' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {chat.type === 'request' ? (
                          <FileText className={`h-5 w-5 ${
                            chat.type === 'request' ? 'text-blue-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {chat.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chat.status)}`}>
                            {chat.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {chat.subtitle}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-800 truncate flex-1 mr-4">
                            <span className="font-medium">{chat.lastMessageFrom}:</span> {chat.lastMessage}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatTime(chat.lastMessageTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}