"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MessageCircle, Eye, EyeOff, Trash2, StopCircle, EyeOffIcon, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ChatItem {
  id: number;
  judul?: string;
  rincian_informasi: string;
  status: string;
  created_at: string;
  assigned_ppid_id?: number;
  pemohon: {
    nama: string;
    email: string;
  };
  assigned_ppid?: {
    id: number;
    nama: string;
    role: string;
  };
  lastMessage?: {
    message: string;
    created_at: string;
  };
  messageCount: number;
}

interface PpidUser {
  id: number;
  nama: string;
  email: string;
  no_pegawai: string;
}

interface PpidChat {
  id: number;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender: {
    id: number;
    nama: string;
    role: string;
  };
  receiver: {
    id: number;
    nama: string;
    role: string;
  };
}

export default function AdminChatPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  const [ppidChats, setPpidChats] = useState<PpidChat[]>([]);
  const [ppidList, setPpidList] = useState<PpidUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [chatType, setChatType] = useState<'requests' | 'ppid'>('requests');
  const [hiddenChats, setHiddenChats] = useState<Set<number>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChats, setSelectedChats] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [showPpidChatModal, setShowPpidChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState({ receiverId: '', subject: '', message: '' });
  const [ppidSearchTerm, setPpidSearchTerm] = useState('');
  const [ppidCurrentPage, setPpidCurrentPage] = useState(1);
  const [ppidHasMore, setPpidHasMore] = useState(true);
  const [ppidLoading, setPpidLoading] = useState(false);
  const [selectedPpid, setSelectedPpid] = useState<PpidUser | null>(null);
  const { token, getUserRole } = useAuth();
  const userRole = getUserRole();

  const fetchChats = useCallback(async () => {
    try {
      let endpoint = "/api/permintaan";
      if (userRole === 'PPID_PELAKSANA') {
        endpoint += "?status=Diproses";
      } else if (userRole === 'PPID_UTAMA') {
        // Get all requests for PPID_UTAMA to filter those with responses
        endpoint += "";
      } else if (userRole === 'ADMIN') {
        endpoint += "?status=Diproses";
      }
      
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data?.success) {
        // Filter chats based on user role
        let filteredData = (data?.data || []);
        if (userRole === 'PPID_UTAMA') {
          // Show requests that have been responded to by PPID (have messages)
          filteredData = (data?.data || []).filter((chat: ChatItem) => chat.messageCount > 0);
        }
        setChats(filteredData);
        setFilteredChats(filteredData);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, userRole]);

  const fetchPpidChats = useCallback(async () => {
    try {
      const response = await fetch("/api/ppid-chat", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data?.success) {
        setPpidChats((data?.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch PPID chats:", error);
    }
  }, [token]);

  const fetchPpidList = useCallback(async (search = '', page = 1) => {
    if (ppidLoading || !token) return;
    setPpidLoading(true);
    try {
      const url = `/api/admin/assign-ppid?search=${encodeURIComponent(search)}&page=${page}&limit=10`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data?.success) {
        if (page === 1) {
          setPpidList((data?.data || []) || []);
        } else {
          setPpidList(prev => [...prev, ...((data?.data || []) || [])]);
        }
        setPpidHasMore(data.pagination?.hasMore || false);
        setPpidCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch PPID list:", error);
      // Set empty state on error
      if (page === 1) {
        setPpidList([]);
        setPpidHasMore(false);
      }
    } finally {
      setPpidLoading(false);
    }
  }, [token, ppidLoading]);

  const loadMorePpid = () => {
    if (ppidHasMore && !ppidLoading) {
      fetchPpidList(ppidSearchTerm, ppidCurrentPage + 1);
    }
  };

  const assignToPpid = async (requestId: number, ppidId: number) => {
    try {
      const response = await fetch("/api/admin/assign-ppid", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId,
          ppidId,
          type: 'request'
        })
      });
      
      if (response.ok) {
        fetchChats();
        setShowAssignModal(false);
        setSelectedRequestId(null);
      }
    } catch (error) {
      console.error("Failed to assign PPID:", error);
    }
  };

  const sendPpidMessage = async () => {
    if (!selectedPpid) return;
    try {
      const response = await fetch("/api/admin/chat-ppid", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: selectedPpid.id,
          message: `${newMessage.subject}: ${newMessage.message}`
        })
      });
      
      if (response.ok) {
        fetchPpidChats();
        setShowPpidChatModal(false);
        setNewMessage({ receiverId: '', subject: '', message: '' });
        setSelectedPpid(null);
        setPpidSearchTerm('');
        setPpidList([]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const toggleHideChat = (chatId: number) => {
    const newHidden = new Set(hiddenChats);
    if (newHidden.has(chatId)) {
      newHidden.delete(chatId);
    } else {
      newHidden.add(chatId);
    }
    setHiddenChats(newHidden);
  };

  const toggleSelectChat = (chatId: number) => {
    const newSelected = new Set(selectedChats);
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId);
    } else {
      newSelected.add(chatId);
    }
    setSelectedChats(newSelected);
  };

  const selectAllChats = () => {
    if (selectedChats.size === filteredChats.length) {
      setSelectedChats(new Set());
    } else {
      setSelectedChats(new Set(filteredChats.map(chat => chat.id)));
    }
  };

  const bulkAction = async (action: 'hide' | 'end' | 'delete') => {
    if (selectedChats.size === 0) return;
    
    const actionText = action === 'hide' ? 'sembunyikan' : action === 'end' ? 'akhiri' : 'hapus';
    if (!confirm(`Yakin ingin ${actionText} ${selectedChats.size} chat yang dipilih?`)) return;
    
    setIsProcessing(true);
    try {
      for (const chatId of selectedChats) {
        if (action === 'hide') {
          toggleHideChat(chatId);
        } else if (action === 'end') {
          await fetch(`/api/permintaan/${chatId}/responses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              message: 'Chat telah diakhiri oleh admin.',
              attachments: [],
              message_type: 'system'
            })
          });
        } else if (action === 'delete') {
          await fetch(`/api/permintaan/${chatId}/responses`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
      setSelectedChats(new Set());
      if (action !== 'hide') fetchChats();
    } catch (error) {
      console.error(`Failed to ${action} chats:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchChats();
      fetchPpidChats();
    }
  }, [token, userRole, fetchChats, fetchPpidChats]);

  useEffect(() => {
    if (showPpidChatModal && token) {
      fetchPpidList('', 1);
    }
  }, [showPpidChatModal, token]);

  useEffect(() => {
    if (showPpidChatModal && token) {
      const timeoutId = setTimeout(() => {
        setPpidCurrentPage(1);
        setPpidList([]);
        fetchPpidList(ppidSearchTerm, 1);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [ppidSearchTerm, showPpidChatModal, token]);

  useEffect(() => {
    if (chatType === 'requests') {
      const filtered = chats.filter(chat => {
        const matchesSearch = 
          chat.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.pemohon?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.pemohon?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || chat.status === statusFilter;
        const isHidden = hiddenChats.has(chat.id);
        const matchesVisibility = showHidden || !isHidden;
        
        return matchesSearch && matchesStatus && matchesVisibility;
      });
      
      setFilteredChats(filtered);
    }
  }, [chats, searchTerm, statusFilter, showHidden, hiddenChats, chatType]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Chat</h1>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setChatType('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                chatType === 'requests' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Chat Permohonan
            </button>
            <button
              onClick={() => setChatType('ppid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                chatType === 'ppid' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Chat PPID
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {chatType === 'ppid' && (
            <button
              onClick={() => setShowPpidChatModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Kirim Pesan
            </button>
          )}
          {selectedChats.size > 0 && chatType === 'requests' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedChats.size} dipilih</span>
              <button
                onClick={() => bulkAction('hide')}
                disabled={isProcessing}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
              >
                <EyeOffIcon className="w-4 h-4 inline mr-1" />
                Sembunyikan
              </button>
              <button
                onClick={() => bulkAction('end')}
                disabled={isProcessing}
                className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
              >
                <StopCircle className="w-4 h-4 inline mr-1" />
                Akhiri
              </button>
              <button
                onClick={() => bulkAction('delete')}
                disabled={isProcessing}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      {chatType === 'requests' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari berdasarkan judul, nama, atau email..."
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="all">Semua Status</option>
                <option value="Diajukan">Diajukan</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            
            <div className="flex items-end gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedChats.size === filteredChats.length && filteredChats.length > 0}
                  onChange={selectAllChats}
                  className="mr-2"
                />
                <span className="text-sm">Pilih Semua</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showHidden}
                  onChange={(e) => setShowHidden(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Tampilkan tersembunyi</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat chat...</div>
        ) : chatType === 'requests' ? (
          filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada chat ditemukan</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredChats.map((chat) => {
                const isHidden = hiddenChats.has(chat.id);
                return (
                  <div key={chat.id} className={`p-6 hover:bg-gray-50 ${isHidden ? 'opacity-60' : ''} ${selectedChats.has(chat.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedChats.has(chat.id)}
                          onChange={() => toggleSelectChat(chat.id)}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {chat.judul || 'Permintaan Informasi'}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              chat.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                              chat.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {chat.status}
                            </span>
                            {chat.assigned_ppid && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                {chat.assigned_ppid.nama}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Pemohon:</strong> {chat.pemohon?.nama} ({chat.pemohon?.email})
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-3">
                            <strong>Informasi:</strong> {chat.rincian_informasi?.substring(0, 100)}...
                          </div>
                          
                          {chat.lastMessage && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-700 mb-1">
                                {chat.lastMessage.message?.substring(0, 150)}...
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(chat.lastMessage.created_at).toLocaleString('id-ID')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <Link href={`/admin/permohonan/${chat.id}`}>
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <MessageCircle className="w-4 h-4" />
                            Buka Chat
                          </button>
                        </Link>
                        
                        <button
                          onClick={() => toggleHideChat(chat.id)}
                          className={`p-2 rounded-lg text-sm ${
                            isHidden 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={isHidden ? 'Tampilkan' : 'Sembunyikan'}
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // PPID Chat View
          ppidChats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada pesan PPID</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ppidChats.map((chat) => (
                <div key={chat.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {chat.subject}
                        </h3>
                        {!chat.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Dari:</strong> {chat.sender.nama} ({chat.sender.role})
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-3">
                        {chat.message.substring(0, 200)}...
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        {new Date(chat.created_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/chat-ppid?ppid=${chat.sender.id}`}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          <MessageCircle className="w-4 h-4" />
                          Buka Chat
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* PPID Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Tugaskan ke PPID Pelaksana</h3>
            <div className="space-y-4">
              {ppidList.map((ppid) => (
                <button
                  key={ppid.id}
                  onClick={() => selectedRequestId && assignToPpid(selectedRequestId, ppid.id)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{ppid.nama}</div>
                  <div className="text-sm text-gray-500">{ppid.email}</div>
                  <div className="text-xs text-gray-400">{ppid.no_pegawai}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequestId(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PPID Chat Modal */}
      {showPpidChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Kirim Pesan ke PPID</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Penerima</label>
                {selectedPpid ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div>
                      <div className="font-medium">{selectedPpid.nama}</div>
                      <div className="text-sm text-gray-500">{selectedPpid.email}</div>
                    </div>
                    <button
                      onClick={() => setSelectedPpid(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Cari PPID..."
                      value={ppidSearchTerm}
                      onChange={(e) => setPpidSearchTerm(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 mb-2"
                    />
                    <div 
                      className="border rounded-lg max-h-40 overflow-y-auto"
                      onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                        if (scrollHeight - scrollTop === clientHeight && ppidHasMore && !ppidLoading) {
                          loadMorePpid();
                        }
                      }}
                    >
                      {ppidList.length === 0 && !ppidLoading ? (
                        <p className="text-gray-500 text-center py-4">Tidak ada PPID ditemukan</p>
                      ) : (
                        ppidList.map((ppid) => (
                          <button
                            key={ppid.id}
                            onClick={() => setSelectedPpid(ppid)}
                            className="w-full text-left p-3 border-b hover:bg-gray-50 last:border-b-0"
                          >
                            <div className="font-medium">{ppid.nama}</div>
                            <div className="text-sm text-gray-500">{ppid.email}</div>
                          </button>
                        ))
                      )}
                      {ppidLoading && (
                        <div className="text-center py-2">
                          <span className="text-gray-500">Loading...</span>
                        </div>
                      )}
                      {!ppidHasMore && ppidList.length > 0 && (
                        <div className="text-center py-2">
                          <span className="text-gray-400 text-sm">Semua PPID telah dimuat</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subjek</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Subjek pesan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Pesan</label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 h-32"
                  placeholder="Tulis pesan..."
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPpidChatModal(false);
                  setNewMessage({ receiverId: '', subject: '', message: '' });
                  setSelectedPpid(null);
                  setPpidSearchTerm('');
                  setPpidList([]);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={sendPpidMessage}
                disabled={!selectedPpid || !newMessage.message}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}