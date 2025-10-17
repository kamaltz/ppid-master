"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ROLES } from '@/lib/roleUtils';
import RoleGuard from '@/components/auth/RoleGuard';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface PPID {
  id: number;
  nama: string;
  email: string;
  role: string;
}

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  sender: { nama: string };
  attachments?: string;
}

export default function PPIDChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ppidId = parseInt(params.id as string);
  
  const [ppid, setPpid] = useState<PPID | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchPpidInfo = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/assign-ppid?search=&page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const foundPpid = data.data.find((p: PPID) => p.id === ppidId);
        setPpid(foundPpid || null);
      }
    } catch (error) {
      console.error('Failed to fetch PPID info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ppid-chat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const filteredMessages = data.data
          .filter((msg: ChatMessage) => 
            (msg.sender_id === ppidId || msg.receiver_id === ppidId)
          )
          .sort((a: ChatMessage, b: ChatMessage) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        setMessages(filteredMessages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !ppid || sending) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const uploadedFiles = [];
      for (const file of attachments) {
        const formData = new FormData();
        formData.append('file', file);
        const endpoint = file.type.startsWith('image/') ? '/api/upload/image' : '/api/upload';
        const uploadResponse = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
        const result = await uploadResponse.json();
        if (result.success) {
          uploadedFiles.push({ name: result.originalName || result.filename, url: result.url, size: result.size });
        }
      }
      
      const response = await fetch('/api/ppid-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: ppid.id,
          message: newMessage.trim(),
          attachments: uploadedFiles
        })
      });
      
      if (response.ok) {
        setNewMessage('');
        setAttachments([]);
        await fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'PPID_UTAMA': 'bg-blue-500 text-white',
      'PPID_PELAKSANA': 'bg-green-500 text-white',
      'ATASAN_PPID': 'bg-purple-500 text-white',
      'ADMIN': 'bg-red-500 text-white'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const isImageFile = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    if (ppidId) {
      fetchPpidInfo();
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [ppidId]);

  // Auto-scroll disabled - users can scroll manually

  // Auto scroll to bottom when messages change
  useEffect(() => {
    const chatContainer = document.querySelector('.overflow-y-auto');
    if (chatContainer && messages.length > 0) {
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 100);
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!ppid) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">PPID Tidak Ditemukan</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID]}>
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Kembali ke Daftar Chat
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Chat dengan {ppid.nama}</h1>
          <p className="text-gray-600">{ppid.email} • {ppid.role.replace('_', ' ')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Komunikasi & Respon</h3>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
              const isMyMessage = msg.sender_id === currentUserId;
              let attachmentList = [];
              try {
                attachmentList = msg.attachments ? JSON.parse(msg.attachments) : [];
              } catch (e) {
                console.log('Error parsing attachments:', e);
              }
              return (
                <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                    isMyMessage 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${
                        isMyMessage ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {msg.sender.nama}
                      </span>
                      <span className={`text-xs ${
                        isMyMessage ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {msg.message && (
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                    )}
                    {attachmentList.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {attachmentList.map((file: { name: string; url: string; size?: number }, index: number) => (
                          <div key={index} className="text-sm">
                            {isImageFile(file.url) ? (
                              <div className="space-y-2">
                                <Image 
                                  src={file.url} 
                                  alt={file.name || 'Attachment image'} 
                                  width={300}
                                  height={200}
                                  className="max-w-xs rounded border cursor-pointer hover:opacity-90" 
                                  onClick={() => window.open(file.url, '_blank')}
                                />
                                <div className="flex items-center gap-1 text-blue-600">
                                  <ImageIcon className="w-4 h-4" />
                                  <span className="text-xs">{file.name}</span>
                                </div>
                              </div>
                            ) : file.name.toLowerCase().endsWith('.pdf') ? (
                              <div className="border rounded p-3 bg-red-50 hover:bg-red-100 cursor-pointer" onClick={() => downloadFile(file.url, file.name)}>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">PDF</div>
                                  <div>
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">Klik untuk download</p>
                                  </div>
                                </div>
                              </div>
                            ) : file.name.toLowerCase().match(/\.(doc|docx)$/) ? (
                              <div className="border rounded p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer" onClick={() => downloadFile(file.url, file.name)}>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">DOC</div>
                                  <div>
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">Klik untuk download</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="border rounded p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => downloadFile(file.url, file.name)}>
                                <div className="flex items-center gap-2">
                                  <Paperclip className="w-5 h-5 text-gray-500" />
                                  <div>
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">Klik untuk download</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t">
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center bg-blue-50 px-2 py-1 rounded text-sm">
                    <span>{file.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))} className="ml-2 text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
                className="hidden"
              />
              <input
                type="file"
                ref={imageInputRef}
                multiple
                accept="image/*,.png,.jpg,.jpeg,.gif,.webp"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Lampirkan dokumen (PDF, DOC, XLS, etc.)"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Lampirkan gambar (PNG, JPG, etc.)"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 border rounded-lg px-3 py-2"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || (!newMessage.trim() && attachments.length === 0)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}