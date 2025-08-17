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

interface KeberatanChatProps {
  keberatanId: number;
  currentUserRole: string;
  isAdmin?: boolean;
}

export default function KeberatanChat({ keberatanId, currentUserRole, isAdmin = false }: KeberatanChatProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatActive, setChatActive] = useState(true);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchResponses = async () => {
    try {
      const response = await fetch(`/api/keberatan/${keberatanId}/responses`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResponses(data.data);
          
          // Check if chat is ended by system message
          const lastMessage = data.data[data.data.length - 1];
          const isEnded = lastMessage && lastMessage.message_type === 'system' && lastMessage.message.includes('diakhiri');
          const isResumed = lastMessage && lastMessage.message_type === 'system' && lastMessage.message.includes('dilanjutkan');
          
          setChatActive(isResumed || !isEnded);
          
          // Check if pemohon can send message
          if (currentUserRole === 'Pemohon') {
            const pemohonMessages = data.data.filter((msg: any) => msg.user_role === 'Pemohon');
            const adminMessages = data.data.filter((msg: any) => ['Admin', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID', 'System'].includes(msg.user_role));
            
            // Check if keberatan is completed
            const isCompleted = data.data.some((msg: any) => msg.message_type === 'system' && msg.message.includes('Selesai'));
            
            // Pemohon can only send if: not ended, not completed, and (no messages yet OR admin has replied)
            const canSend = !isEnded && !isCompleted && (pemohonMessages.length === 0 || adminMessages.length > pemohonMessages.length);
            setCanSendMessage(canSend);
          } else {
            setCanSendMessage(!isEnded || isAdmin || currentUserRole === 'PPID_PELAKSANA');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch keberatan responses:', error);
    }
  };

  const sendResponse = async () => {
    if (currentUserRole === 'Pemohon' && !canSendMessage) {
      alert('⏳ Mohon tunggu balasan dari PPID sebelum mengirim pesan lagi.');
      return;
    }
    if (!chatActive && !isAdmin && currentUserRole !== 'PPID_PELAKSANA') {
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

      const response = await fetch(`/api/keberatan/${keberatanId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.trim(),
          attachments: uploadedFiles,
          user_role: currentUserRole
        })
      });

      if (response.ok) {
        setMessage('');
        setAttachments([]);
        
        // Send system notification for pemohon after first message
        if (currentUserRole === 'Pemohon') {
          setTimeout(async () => {
            await fetch(`/api/keberatan/${keberatanId}/responses`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
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
        
        await fetchResponses();
      } else {
        alert('Gagal mengirim pesan');
      }
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Gagal mengirim pesan');
    } finally {
      setIsLoading(false);
    }
  };

  const endChat = async () => {
    if (!confirm('Yakin ingin mengakhiri chat? Pemohon tidak akan bisa mengirim pesan lagi.')) return;
    
    setChatActive(false);
    setCanSendMessage(false);
    
    try {
      await fetch(`/api/keberatan/${keberatanId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
    
    setChatActive(true);
    setCanSendMessage(true);
    
    try {
      await fetch(`/api/keberatan/${keberatanId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  useEffect(() => {
    fetchResponses();
    const interval = setInterval(fetchResponses, 3000);
    return () => clearInterval(interval);
  }, [keberatanId]);

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
        <h3 className="text-lg font-semibold text-red-600">Chat Keberatan #{keberatanId}</h3>
        <div className="flex items-center gap-2">
          {!chatActive && (
            <span className="text-sm text-red-600 font-medium">Chat Diakhiri</span>
          )}
          {(isAdmin || currentUserRole === 'PPID_PELAKSANA') && (
            <div className="flex gap-2">
              {chatActive ? (
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
            console.log('Error parsing attachments:', e);
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
              <div className={`p-3 rounded-lg ${isSystemMessage ? 'bg-red-50 border border-red-200 text-center' : 'bg-gray-50'}`}>
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
      </div>
      
      <div className="p-4 border-t">
        {!chatActive && !isAdmin && currentUserRole !== 'PPID_PELAKSANA' ? (
          <div className="text-center py-4 text-gray-500">
            <p>Chat telah diakhiri. Tidak dapat mengirim pesan baru.</p>
          </div>
        ) : (
          <>
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center bg-red-50 px-2 py-1 rounded text-sm">
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
                title="Lampirkan dokumen"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Lampirkan gambar"
              >
                <Image className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  !chatActive ? "Chat telah diakhiri" :
                  currentUserRole === 'Pemohon' && !canSendMessage ? "⏳ Menunggu balasan PPID..." :
                  "Tulis pesan keberatan..."
                }
                className="flex-1 border rounded-lg px-3 py-2"
                onKeyPress={(e) => e.key === 'Enter' && sendResponse()}
                disabled={(currentUserRole === 'Pemohon' && (!chatActive || !canSendMessage)) || (currentUserRole !== 'Pemohon' && !chatActive && !['Admin', 'PPID_PELAKSANA'].includes(currentUserRole))}
              />
              <button
                onClick={sendResponse}
                disabled={isLoading || (!message.trim() && attachments.length === 0) || (currentUserRole === 'Pemohon' && !canSendMessage) || (!chatActive && !isAdmin && currentUserRole !== 'PPID_PELAKSANA')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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