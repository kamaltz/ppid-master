"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Download, X, Image, StopCircle } from 'lucide-react';

interface Response {
  id: number;
  user_name: string;
  user_role: string;
  message: string;
  message_type?: string;
  attachments?: string;
  created_at: string;
}

interface ChatSession {
  is_active: boolean;
  ended_by?: string;
  ended_at?: string;
}

interface RequestChatProps {
  requestId: number;
  currentUserRole: string;
  isAdmin?: boolean;
}

export default function RequestChat({ requestId, currentUserRole, isAdmin = false }: RequestChatProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession>({ is_active: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/permintaan/${requestId}/responses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setResponses(data.data);
        // Check if chat was ended by looking for system message
        const systemMessage = data.data.find((msg: any) => msg.user_role === 'System' && msg.message.includes('Chat telah diakhiri'));
        setChatSession({ is_active: !systemMessage });
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    }
  };

  const sendResponse = async (messageType = 'text') => {
    if (!chatSession.is_active) {
      alert('Chat telah diakhiri');
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      alert('Tulis pesan atau lampirkan file');
      return;
    }
    
    setIsLoading(true);
    try {
      const uploadedFiles = [];
      for (const file of attachments) {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('auth_token');
        const endpoint = file.type.startsWith('image/') ? '/api/upload/image' : '/api/upload';
        const uploadResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const result = await uploadResponse.json();
        if (result.success) {
          uploadedFiles.push({ name: result.originalName || result.filename, url: result.url, size: result.size });
        }
      }

      const token = localStorage.getItem('auth_token');

      const response = await fetch(`/api/permintaan/${requestId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message.trim(),
          attachments: uploadedFiles
        })
      });

      if (response.ok) {
        setMessage('');
        setAttachments([]);
        fetchResponses();
      } else {
        const errorData = await response.json();
        alert('Gagal mengirim pesan: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to send response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endChat = async () => {
    if (!confirm('Yakin ingin mengakhiri chat? Pemohon tidak akan bisa mengirim pesan lagi.')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/chat/${requestId}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchResponses();
      }
    } catch (error) {
      console.error('Failed to end chat:', error);
    }
  };

  useEffect(() => {
    fetchResponses();
    const interval = setInterval(fetchResponses, 2000); // More frequent updates
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  const getRoleColor = (role: string) => {
    const colors = {
      'Admin': 'bg-red-500 text-white',
      'PPID_UTAMA': 'bg-blue-500 text-white',
      'PPID_PELAKSANA': 'bg-green-500 text-white',
      'ATASAN_PPID': 'bg-purple-500 text-white',
      'Pemohon': 'bg-indigo-500 text-white',
      'System': 'bg-orange-500 text-white'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const isImageFile = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Komunikasi & Respon</h3>
        <div className="flex items-center gap-2">
          {!chatSession.is_active && (
            <span className="text-sm text-red-600 font-medium">Chat Diakhiri</span>
          )}
          {isAdmin && chatSession.is_active && (
            <button
              onClick={endChat}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
            >
              <StopCircle className="w-4 h-4" />
              Akhiri Chat
            </button>
          )}
        </div>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {responses.map((resp) => {
          let attachmentList = [];
          try {
            attachmentList = resp.attachments ? JSON.parse(resp.attachments) : [];
          } catch (e) {
            console.log('Error parsing attachments:', e, resp.attachments);
          }
          const isSystemMessage = resp.message_type === 'system';
          return (
            <div key={resp.id} className={`flex flex-col space-y-2 ${isSystemMessage ? 'items-center' : ''}`}>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(resp.user_role)}`}>
                  {resp.user_name}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(resp.created_at).toLocaleString('id-ID')}
                </span>
              </div>
              <div className={`p-3 rounded-lg ${isSystemMessage ? 'bg-yellow-50 border border-yellow-200 text-center' : 'bg-gray-50'}`}>
                {resp.message && <p className="text-gray-800">{resp.message}</p>}
                {attachmentList.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachmentList.map((file: any, index: number) => (
                      <div key={index} className="text-sm">
                        {isImageFile(file.url) ? (
                          <div className="space-y-2">
                            <img 
                              src={file.url} 
                              alt={file.name} 
                              className="max-w-xs rounded border cursor-pointer hover:opacity-90" 
                              onClick={() => window.open(file.url, '_blank')}
                            />
                            <div className="flex items-center gap-1 text-blue-600">
                              <Image className="w-4 h-4" />
                              <span className="text-xs">{file.name}</span>
                            </div>
                          </div>
                        ) : file.name.toLowerCase().endsWith('.pdf') ? (
                          <div className="border rounded p-3 bg-red-50 hover:bg-red-100 cursor-pointer" onClick={() => window.open(file.url, '_blank')}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">PDF</div>
                              <div>
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">Klik untuk membuka</p>
                              </div>
                            </div>
                          </div>
                        ) : file.name.toLowerCase().match(/\.(doc|docx)$/) ? (
                          <div className="border rounded p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer" onClick={() => window.open(file.url, '_blank')}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">DOC</div>
                              <div>
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">Klik untuk membuka</p>
                              </div>
                            </div>
                          </div>
                        ) : file.name.toLowerCase().match(/\.(xls|xlsx)$/) ? (
                          <div className="border rounded p-3 bg-green-50 hover:bg-green-100 cursor-pointer" onClick={() => window.open(file.url, '_blank')}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">XLS</div>
                              <div>
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">Klik untuk membuka</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border rounded p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => window.open(file.url, '_blank')}>
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">Klik untuk membuka</p>
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
        {!chatSession.is_active ? (
          <div className="text-center py-4 text-gray-500">
            <p>Chat telah diakhiri. Tidak dapat mengirim pesan baru.</p>
            {chatSession.ended_by && (
              <p className="text-sm mt-1">Diakhiri oleh: {chatSession.ended_by}</p>
            )}
          </div>
        ) : (
          <>
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
                <Image className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={chatSession.is_active ? "Tulis pesan..." : "Chat telah diakhiri"}
                className="flex-1 border rounded-lg px-3 py-2"
                onKeyPress={(e) => e.key === 'Enter' && sendResponse()}
                disabled={!chatSession.is_active}
              />
              <button
                onClick={() => sendResponse()}
                disabled={isLoading || (!message.trim() && attachments.length === 0) || !chatSession.is_active}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}