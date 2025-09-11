"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, StopCircle } from 'lucide-react';
import Image from 'next/image';

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
  userRole?: string;
  currentUserRole?: string;
  isAdmin?: boolean;
}

export default function RequestChat({ requestId, userRole, currentUserRole, isAdmin = false }: RequestChatProps) {
  const actualUserRole = userRole || currentUserRole || 'PEMOHON';
  const [responses, setResponses] = useState<Response[]>([]);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession>({ is_active: true });
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [showPpidModal, setShowPpidModal] = useState(false);
  const [ppidList, setPpidList] = useState<{id: number, nama: string, email: string, no_pegawai: string, role: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPpid, setLoadingPpid] = useState(false);
  const loadingPpidRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchResponses = useCallback(async () => {
    try {
      const response = await fetch(`/api/permintaan/${requestId}/responses`);
      if (!response.ok) {
        console.error('Response not ok:', response.status);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setResponses(data.data);
        
        // Check if chat is ended by system message
        const lastMessage = data.data[data.data.length - 1];
        const isEnded = lastMessage && lastMessage.message_type === 'system' && lastMessage.message.includes('diakhiri');
        const isResumed = lastMessage && lastMessage.message_type === 'system' && lastMessage.message.includes('dilanjutkan');
        
        setChatSession({ is_active: isResumed || !isEnded });
        
        // Check if pemohon can send message
        if (actualUserRole === 'PEMOHON') {
          const pemohonMessages = data.data.filter((msg: Response) => msg.user_role === 'PEMOHON');
          const adminMessages = data.data.filter((msg: Response) => ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID', 'System'].includes(msg.user_role));
          
          // Check if request is completed
          const isCompleted = data.data.some((msg: Response) => msg.message_type === 'system' && msg.message.includes('Selesai'));
          
          // Pemohon can send first message freely, then must wait for reply
          const canSend = !isEnded && !isCompleted && (pemohonMessages.length === 0 || adminMessages.length >= pemohonMessages.length);
          setCanSendMessage(canSend);
        } else {
          setCanSendMessage(!isEnded || isAdmin || actualUserRole === 'PPID_PELAKSANA');
        }
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    }
  }, [requestId, actualUserRole, isAdmin]);

  const sendResponse = async () => {
    if (actualUserRole === 'PEMOHON' && !canSendMessage) {
      alert('⏳ Mohon tunggu balasan dari PPID sebelum mengirim pesan lagi.');
      return;
    }
    if (!chatSession.is_active && !isAdmin && actualUserRole !== 'PPID_PELAKSANA') {
      alert('Chat telah diakhiri.');
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      alert('Tulis pesan atau lampirkan file');
      return;
    }
    if (attachments.length > 0 && !message.trim()) {
      alert('Pesan wajib diisi saat mengirim file atau gambar!');
      return;
    }
    
    setIsLoading(true);
    try {
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

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/permintaan/${requestId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message.trim(),
          attachments: uploadedFiles,
          user_role: actualUserRole
        })
      });

      if (response.ok) {
        setMessage('');
        setAttachments([]);
        
        // Send system notification for pemohon after first message only
        if (actualUserRole === 'PEMOHON') {
          const pemohonMessages = responses.filter(msg => msg.user_role === 'PEMOHON');
          if (pemohonMessages.length === 0) {
            setTimeout(async () => {
              const token = localStorage.getItem('auth_token');
              await fetch(`/api/permintaan/${requestId}/responses`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  message: '✅ Pesan Anda telah terkirim. Mohon tunggu balasan dari PPID.',
                  attachments: [],
                  user_role: 'System',
                  message_type: 'system'
                })
              });
              fetchResponses();
            }, 1000);
          }
        }
        
        await fetchResponses();
        // Refresh chat list to show updated conversation
        setTimeout(() => {
          window.dispatchEvent(new Event('ppid-chat-updated'));
          // Also try localStorage event for cross-tab communication
          localStorage.setItem('chat-refresh', Date.now().toString());
        }, 1000);
      } else {
        const errorData = await response.json();
        alert('Gagal mengirim pesan: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const endChat = async () => {
    if (!confirm('Yakin ingin mengakhiri chat? Pemohon tidak akan bisa mengirim pesan lagi.')) return;
    
    setChatSession({ is_active: false });
    setCanSendMessage(false);
    
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/permintaan/${requestId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: 'Chat telah diakhiri oleh admin.',
          attachments: [],
          message_type: 'system',
          user_role: 'System'
        })
      });
      
      fetchResponses();
    } catch (error) {
      console.error('Failed to end chat:', error);
    }
  };

  const resumeChat = async () => {
    if (!confirm('Yakin ingin melanjutkan chat? Pemohon akan bisa mengirim pesan lagi.')) return;
    
    setChatSession({ is_active: true });
    setCanSendMessage(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/permintaan/${requestId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: 'Chat telah dilanjutkan oleh admin.',
          attachments: [],
          message_type: 'system',
          user_role: 'System'
        })
      });
      
      fetchResponses();
    } catch (error) {
      console.error('Failed to resume chat:', error);
    }
  };

  const fetchPpidList = useCallback(async (search = '', page = 1) => {
    if (loadingPpidRef.current) return;
    loadingPpidRef.current = true;
    setLoadingPpid(true);
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
      loadingPpidRef.current = false;
      setLoadingPpid(false);
    }
  }, []);

  const loadMorePpid = () => {
    if (hasMore && !loadingPpidRef.current) {
      fetchPpidList(searchTerm, currentPage + 1);
    }
  };

  const forwardToPpid = async (ppidId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/assign-ppid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: requestId,
          ppidId: ppidId,
          type: 'request'
        })
      });
      if (response.ok) {
        setShowPpidModal(false);
        alert('Permohonan berhasil diteruskan ke PPID');
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to forward request:', error);
      alert('Gagal meneruskan permohonan');
    }
  };

  useEffect(() => {
    if (showPpidModal) {
      setSearchTerm('');
      setPpidList([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchPpidList('', 1);
    }
  }, [showPpidModal, fetchPpidList]);

  useEffect(() => {
    if (showPpidModal && searchTerm !== '') {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        setPpidList([]);
        fetchPpidList(searchTerm, 1);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, showPpidModal, fetchPpidList]);

  useEffect(() => {
    fetchResponses();
    const interval = setInterval(fetchResponses, 2000);
    return () => clearInterval(interval);
  }, [requestId, fetchResponses]);

  // Auto-scroll disabled - users can scroll manually

  const getRoleColor = (role: string) => {
    const colors = {
      'Admin': 'bg-red-500 text-white',
      'PPID_UTAMA': 'bg-blue-500 text-white',
      'PPID_PELAKSANA': 'bg-green-500 text-white',
      'ATASAN_PPID': 'bg-purple-500 text-white',
      'PEMOHON': 'bg-indigo-500 text-white',
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
          {(isAdmin || actualUserRole === 'PPID_PELAKSANA') && (
            <div className="flex gap-2">
              {chatSession.is_active ? (
                <button
                  onClick={endChat}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
                >
                  <StopCircle className="w-4 h-4" />
                  Akhiri Chat
                </button>
              ) : (
                <button
                  onClick={resumeChat}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                >
                  <StopCircle className="w-4 h-4" />
                  Lanjutkan Chat
                </button>
              )}
              <button
                onClick={() => setShowPpidModal(true)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Teruskan ke PPID
              </button>
            </div>
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
                  {resp.user_role === 'PPID_PELAKSANA' ? resp.user_name : 
                   resp.user_role === 'PPID_UTAMA' ? resp.user_name :
                   resp.user_role === 'ATASAN_PPID' ? resp.user_name :
                   resp.user_role}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(resp.created_at).toLocaleString('id-ID')}
                </span>
              </div>
              <div className={`p-3 rounded-lg ${isSystemMessage ? 'bg-yellow-50 border border-yellow-200 text-center' : 'bg-gray-50'}`}>
                {resp.message && <p className="text-gray-800">{resp.message}</p>}
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
        {!chatSession.is_active && !isAdmin ? (
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
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  !chatSession.is_active ? "Chat telah diakhiri" :
                  actualUserRole === 'PEMOHON' && !canSendMessage ? "⏳ Menunggu balasan PPID..." :
                  "Tulis pesan..."
                }
                className="flex-1 border rounded-lg px-3 py-2"
                onKeyPress={(e) => e.key === 'Enter' && sendResponse()}
                disabled={(actualUserRole === 'PEMOHON' && (!chatSession.is_active || !canSendMessage)) || (actualUserRole !== 'PEMOHON' && !chatSession.is_active && !['ADMIN', 'PPID_PELAKSANA'].includes(actualUserRole))}
              />
              <button
                onClick={() => sendResponse()}
                disabled={isLoading || (!message.trim() && attachments.length === 0) || (actualUserRole === 'PEMOHON' && !canSendMessage) || (!chatSession.is_active && !isAdmin && actualUserRole !== 'PPID_PELAKSANA')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* PPID Selection Modal */}
      {showPpidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Teruskan ke PPID</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pilih PPID untuk meneruskan permohonan ini
            </p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari nama, email, atau NIP PPID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div 
              className="space-y-2 max-h-60 overflow-y-auto"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop === clientHeight && hasMore && !loadingPpid) {
                  loadMorePpid();
                }
              }}
            >
              {ppidList.length === 0 && !loadingPpid && searchTerm ? (
                <p className="text-gray-500 text-center py-4">Tidak ada PPID ditemukan untuk "{searchTerm}"</p>
              ) : ppidList.length === 0 && !loadingPpid ? (
                <p className="text-gray-500 text-center py-4">Memuat daftar PPID...</p>
              ) : (
                ppidList.map((ppid) => (
                  <button
                    key={ppid.id}
                    onClick={() => forwardToPpid(ppid.id)}
                    className="w-full flex items-center p-3 border rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{ppid.nama}</div>
                      <div className="text-sm text-gray-500">{ppid.email}</div>
                      <div className="text-xs text-gray-400">NIP: {ppid.no_pegawai}</div>
                    </div>
                    <div className="ml-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ppid.role === 'PPID_UTAMA' ? 'bg-blue-100 text-blue-800' :
                        ppid.role === 'PPID_PELAKSANA' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {ppid.role === 'PPID_UTAMA' ? 'PPID Utama' :
                         ppid.role === 'PPID_PELAKSANA' ? 'PPID Pelaksana' :
                         'Atasan PPID'}
                      </span>
                    </div>
                  </button>
                ))
              )}
              {loadingPpid && (
                <div className="text-center py-2">
                  <span className="text-gray-500">Loading...</span>
                </div>
              )}
              {!hasMore && ppidList.length > 0 && (
                <div className="text-center py-2">
                  <span className="text-gray-400 text-sm">Semua PPID telah dimuat</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPpidModal(false);
                  setSearchTerm('');
                  setPpidList([]);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}