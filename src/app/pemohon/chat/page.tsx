"use client";

import { useState, useEffect } from "react";
import { MessageCircle, FileText, AlertTriangle } from "lucide-react";
import { usePemohonData } from "@/hooks/usePemohonData";
import RequestChat from "@/components/RequestChat";
import KeberatanChat from "@/components/KeberatanChat";

interface ChatItem {
  id: number;
  type: 'permohonan' | 'keberatan';
  title: string;
  status: string;
  created_at: string;
  hasMessages: boolean;
}

interface KeberatanData {
  id: number;
  judul?: string;
  alasan_keberatan?: string;
  status?: string;
  created_at: string;
}

export default function ChatPage() {
  const { permintaan, isLoading } = usePemohonData();
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [keberatan, setKeberatan] = useState<KeberatanData[]>([]);

  useEffect(() => {
    const fetchKeberatan = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      try {
        const response = await fetch('/api/keberatan', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setKeberatan(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch keberatan:', error);
      }
    };

    fetchKeberatan();
  }, []);

  useEffect(() => {
    const items: ChatItem[] = [
      ...permintaan.map(req => ({
        id: req.id,
        type: 'permohonan' as const,
        title: req.rincian_informasi.substring(0, 50) + '...',
        status: req.status,
        created_at: req.created_at,
        hasMessages: true
      })),
      ...keberatan.map(keb => ({
        id: keb.id,
        type: 'keberatan' as const,
        title: keb.judul || keb.alasan_keberatan?.substring(0, 50) + '...',
        status: keb.status || 'Diajukan',
        created_at: keb.created_at,
        hasMessages: true
      }))
    ];
    
    setChatItems(items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, [permintaan, keberatan]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diajukan": return "text-purple-600 bg-purple-100";
      case "Diproses": return "text-indigo-600 bg-indigo-100";
      case "Selesai": return "text-green-600 bg-green-100";
      case "Ditolak": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (selectedChat) {
    return (
      <div className="h-full">
        <div className="mb-4">
          <button
            onClick={() => setSelectedChat(null)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Kembali ke Daftar Chat
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">
            Chat - {selectedChat.title}
          </h1>
        </div>
        {selectedChat.type === 'permohonan' ? (
          <RequestChat 
            requestId={selectedChat.id} 
            currentUserRole="Pemohon" 
            isAdmin={false} 
          />
        ) : (
          <KeberatanChat 
            keberatanId={selectedChat.id} 
            currentUserRole="Pemohon" 
            isAdmin={false} 
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Chat</h1>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Chat</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Loading...
            </div>
          ) : chatItems.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Belum ada chat tersedia
            </div>
          ) : (
            chatItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedChat(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.type === 'permohonan' ? (
                      <FileText className="h-5 w-5 text-blue-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.type === 'permohonan' ? 'Permohonan' : 'Keberatan'} #{item.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}