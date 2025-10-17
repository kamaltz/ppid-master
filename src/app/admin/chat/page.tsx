"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Clock, User, FileText, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';

interface ChatItem {
  id: number;
  type: 'request' | 'keberatan';
  title: string;
  subtitle: string;
  pemohon?: string;
  email?: string;
  status: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageFrom: string;
  url: string;
  assignedPpid?: string;
  isAssignedToMe?: boolean;
}

interface PPIDChat {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  sender: { id: number; nama: string; role: string };
  receiver: { id: number; nama: string; role: string };
}

export default function ChatListPage() {
  const { getUserRole } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [ppidChats, setPpidChats] = useState<PPIDChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pemohon' | 'ppid'>('pemohon');
  const [filter, setFilter] = useState<'all' | 'request' | 'keberatan'>('all');
  const [viewedChats, setViewedChats] = useState<Set<string>>(new Set());
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'time'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const getViewedChats = (): Set<string> => {
    const saved = localStorage.getItem('viewedChats');
    return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
  };

  const markChatAsViewed = (chatId: string) => {
    const viewed = getViewedChats();
    viewed.add(chatId);
    localStorage.setItem('viewedChats', JSON.stringify([...viewed]));
    setViewedChats(viewed);
  };

  const isUnread = (chat: ChatItem) => {
    const chatKey = `${chat.type}-${chat.id}`;
    return !viewedChats.has(chatKey) && chat.lastMessageFrom !== 'System' && !['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(chat.lastMessageFrom);
  };

  const isPpidChatUnread = (chat: PPIDChat) => {
    const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
    const chatKey = `ppid-${chat.id}`;
    return !viewedChats.has(chatKey) && chat.sender_id !== currentUserId;
  };

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const [pemohonResponse, ppidResponse] = await Promise.all([
        fetch('/api/chat-list', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/ppid-chat', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (pemohonResponse.ok) {
        const data = await pemohonResponse.json();
        setChats(data.data || []);
      }
      
      if (ppidResponse.ok) {
        const data = await ppidResponse.json();
        console.log('PPID Chat data:', data); // Debug log
        const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
        
        if (data.success && data.data) {
          const uniqueChats = new Map();
          data.data.forEach((chat: PPIDChat) => {
            const partnerId = chat.sender_id === currentUserId ? chat.receiver_id : chat.sender_id;
            if (!uniqueChats.has(partnerId) || new Date(chat.created_at) > new Date(uniqueChats.get(partnerId).created_at)) {
              uniqueChats.set(partnerId, chat);
            }
          });
          
          setPpidChats(Array.from(uniqueChats.values()));
        } else {
          console.log('PPID Chat API error:', data.error);
          setPpidChats([]);
        }
      } else {
        console.log('PPID Chat API failed:', ppidResponse.status);
        setPpidChats([]);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setViewedChats(getViewedChats());
    fetchChats();
    const interval = setInterval(fetchChats, 30000);
    
    const handleChatUpdate = () => fetchChats();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat-refresh') {
        fetchChats();
      }
    };
    
    window.addEventListener('ppid-chat-updated', handleChatUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('ppid-chat-updated', handleChatUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredChats = chats
    .filter(chat => {
      if (filter !== 'all' && chat.type !== filter) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          chat.title.toLowerCase().includes(searchLower) ||
          chat.subtitle.toLowerCase().includes(searchLower) ||
          chat.pemohon?.toLowerCase().includes(searchLower) ||
          chat.email?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = (a.pemohon || '').localeCompare(b.pemohon || '');
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = new Date(a.lastMessageTime).getTime() - new Date(b.lastMessageTime).getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

  const paginatedChats = filteredChats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredChats.length / itemsPerPage);

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">💬 Daftar Chat</h1>
            <p className="text-gray-600">Kelola percakapan dengan pemohon dan sesama PPID</p>
          </div>
          {selectedChats.size > 0 && activeTab === 'pemohon' && (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (confirm(`Hapus ${selectedChats.size} chat yang dipilih?`)) {
                    try {
                      const token = localStorage.getItem('auth_token');
                      const chatIds = Array.from(selectedChats);
                      
                      await Promise.all(chatIds.map(async (chatKey) => {
                        const [type, id] = chatKey.split('-');
                        const endpoint = type === 'request' ? 'permintaan' : 'keberatan';
                        
                        await fetch(`/api/${endpoint}/${id}/delete-chat`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                      }));
                      
                      setSelectedChats(new Set());
                      fetchChats();
                    } catch (error) {
                      console.error('Error deleting chats:', error);
                      alert('Gagal menghapus chat');
                    }
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Hapus ({selectedChats.size})
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Hentikan ${selectedChats.size} chat yang dipilih?`)) {
                    try {
                      const token = localStorage.getItem('auth_token');
                      const chatIds = Array.from(selectedChats);
                      
                      await Promise.all(chatIds.map(async (chatKey) => {
                        const [type, id] = chatKey.split('-');
                        const endpoint = type === 'request' ? 'permintaan' : 'keberatan';
                        
                        await fetch(`/api/${endpoint}/${id}/end-chat`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                      }));
                      
                      setSelectedChats(new Set());
                      fetchChats();
                    } catch (error) {
                      console.error('Error stopping chats:', error);
                      alert('Gagal menghentikan chat');
                    }
                  }
                }}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                Hentikan ({selectedChats.size})
              </button>
              <button
                onClick={() => {
                  setSelectedChats(new Set());
                }}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pemohon')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 relative ${
                activeTab === 'pemohon'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat Pemohon ({chats.length})
              {(() => {
                const unreadCount = chats.filter(c => isUnread(c)).length;
                return unreadCount > 0 ? (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                    {unreadCount}
                  </span>
                ) : null;
              })()}
            </button>
            <button
              onClick={() => setActiveTab('ppid')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 relative ${
                activeTab === 'ppid'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Chat PPID ({ppidChats.length})
              {(() => {
                const unreadCount = ppidChats.filter(c => isPpidChatUnread(c)).length;
                return unreadCount > 0 ? (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                    {unreadCount}
                  </span>
                ) : null;
              })()}
            </button>
          </nav>
        </div>
      </div>

      {/* Chat Content */}
      {activeTab === 'pemohon' && (
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Cari berdasarkan topik, nama, atau email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Tampilkan:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Semua ({chats.length})
                </button>
                <button
                  onClick={() => setFilter('request')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'request'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Permohonan ({chats.filter(c => c.type === 'request').length})
                </button>
                <button
                  onClick={() => setFilter('keberatan')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'keberatan'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Keberatan ({chats.filter(c => c.type === 'keberatan').length})
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Urutkan:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'time')}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="time">Waktu</option>
                  <option value="name">Nama (A-Z)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Urutan:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                Menampilkan {Math.min(itemsPerPage, filteredChats.length)} dari {filteredChats.length} chat
              </div>
            </div>
          </div>

          {/* Chat List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Memuat chat...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{searchTerm ? 'Tidak ada chat yang sesuai pencarian' : 'Belum ada chat tersedia'}</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedChats.map((chat) => {
                const chatKey = `${chat.type}-${chat.id}`;
                return (
                  <div
                    key={chatKey}
                    className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                      isUnread(chat) ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {chat.type === 'request' ? (
                            <FileText className="w-4 h-4 text-blue-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          )}
                          <h3 className="font-medium text-gray-900">{chat.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chat.status)}`}>
                            {chat.status}
                          </span>
                          {chat.assignedPpid && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              chat.isAssignedToMe ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {chat.isAssignedToMe ? 'Ditugaskan ke Anda' : `Ditugaskan: ${chat.assignedPpid}`}
                            </span>
                          )}
                          {isUnread(chat) && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              !
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{chat.subtitle}</p>
                        {chat.pemohon && (
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {chat.pemohon}
                            </span>
                            {chat.email && <span>{chat.email}</span>}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{chat.lastMessageFrom}:</span> {chat.lastMessage}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(chat.lastMessageTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <input
                          type="checkbox"
                          checked={selectedChats.has(chatKey)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedChats);
                            if (e.target.checked) {
                              newSelected.add(chatKey);
                            } else {
                              newSelected.delete(chatKey);
                            }
                            setSelectedChats(newSelected);
                          }}
                          className="rounded border-gray-300"
                        />
                        <Link
                          href={chat.url}
                          onClick={() => {
                            markChatAsViewed(chatKey);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Buka Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white p-4 rounded-lg shadow-md mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Halaman {currentPage} dari {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Sebelumnya
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 2
                        )
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 border rounded text-sm ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))
                      }
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'ppid' && (
        <div className="space-y-4">
          {/* Header dengan tombol Chat Baru */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chat PPID</h3>
              <p className="text-sm text-gray-600">Percakapan dengan sesama PPID</p>
            </div>
            <Link
              href="/admin/chat-ppid"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              Chat Baru
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Memuat chat PPID...</p>
            </div>
          ) : ppidChats.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Belum ada chat PPID</h3>
              <p className="text-gray-500 mb-4">Mulai percakapan baru dengan PPID lain</p>
              <Link
                href="/admin/chat-ppid"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                Mulai Chat Baru
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ppidChats.map((chat) => {
                const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
                const partner = chat.sender_id === currentUserId ? chat.receiver : chat.sender;
                return (
                  <div
                    key={chat.id}
                    className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                      isPpidChatUnread(chat) ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <h3 className="font-medium text-gray-900">
                            Chat dengan {partner.nama}
                          </h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {partner.role.replace('_', ' ')}
                          </span>
                          {isPpidChatUnread(chat) && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              !
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{chat.sender.nama}:</span> {chat.message}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(chat.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link
                          href={`/admin/ppid-chat/${partner.id}`}
                          onClick={() => {
                            markChatAsViewed(`ppid-${chat.id}`);
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Buka Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}