"use client";

import { useState, useEffect } from "react";
import { Search, MessageCircle, Eye, EyeOff, Trash2, StopCircle, EyeOffIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ChatItem {
  id: number;
  judul?: string;
  rincian_informasi: string;
  status: string;
  created_at: string;
  pemohon: {
    nama: string;
    email: string;
  };
  lastMessage?: {
    message: string;
    created_at: string;
  };
  messageCount: number;
}

export default function AdminChatPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hiddenChats, setHiddenChats] = useState<Set<number>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChats, setSelectedChats] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const { token } = useAuth();

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/permintaan?status=Diproses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setChats(data.data);
        setFilteredChats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setIsLoading(false);
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
    fetchChats();
  }, [token]);

  useEffect(() => {
    let filtered = chats.filter(chat => {
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
  }, [chats, searchTerm, statusFilter, showHidden, hiddenChats]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Chat</h1>
        
        {selectedChats.size > 0 && (
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat chat...</div>
        ) : filteredChats.length === 0 ? (
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
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {chat.judul || chat.rincian_informasi.substring(0, 50) + "..."}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            chat.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                            chat.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {chat.status}
                          </span>
                          {isHidden && (
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              Tersembunyi
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Pemohon:</strong> {chat.pemohon?.nama || 'N/A'} ({chat.pemohon?.email || 'N/A'})
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          Dibuat {new Date(chat.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleHideChat(chat.id)}
                        className={`p-2 rounded-lg ${
                          isHidden 
                            ? 'text-gray-400 hover:text-gray-600' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        title={isHidden ? 'Tampilkan chat' : 'Sembunyikan chat'}
                      >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      
                      <Link
                        href={`/admin/permohonan/${chat.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
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
    </div>
  );
}