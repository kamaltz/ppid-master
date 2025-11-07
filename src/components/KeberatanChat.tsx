"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, StopCircle, FileCheck } from 'lucide-react';
import Image from 'next/image';
import UsageEvidenceForm from './UsageEvidenceForm';

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
  userRole?: string;
  currentUserRole?: string;
  isAdmin?: boolean;
}

export default function KeberatanChat({ keberatanId, userRole, currentUserRole, isAdmin = false }: KeberatanChatProps) {
  const actualUserRole = userRole || currentUserRole || 'PEMOHON';
  const [responses, setResponses] = useState<Response[]>([]);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatActive, setChatActive] = useState(true);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [showPpidModal, setShowPpidModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ppidList, setPpidList] = useState<{id: number, nama: string, email: string, role: string}[]>([]);
  const [selectedPpid, setSelectedPpid] = useState<{id: number, nama: string, email: string, role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPpid, setLoadingPpid] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [keberatanStatus, setKeberatanStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchResponses = useCallback(async () => {
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
          const isCompleted = data.data.some((msg: Response) => msg.message_type === 'system' && msg.message.includes('Selesai'));
          
          setChatActive(isResumed || !isEnded);
          setKeberatanStatus(isCompleted ? 'Selesai' : 'Active');
          
          // Check if pemohon can send message
          if (actualUserRole === 'PEMOHON') {
            // Check if keberatan is completed
            const isCompleted = data.data.some((msg: Response) => msg.message_type === 'system' && msg.message.includes('Selesai'));
            
            // Pemohon can always send message unless chat is ended or completed
            const canSend = !isEnded && !isCompleted;
            setCanSendMessage(canSend);
          } else {
            setCanSendMessage(!isEnded || isAdmin || actualUserRole === 'PPID_PELAKSANA');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch keberatan responses:', error);
    }
  }, [keberatanId, actualUserRole, isAdmin]);

  const sendResponse = async () => {
    if (!chatActive && !isAdmin && actualUserRole !== 'PPID_PELAKSANA') {
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
      const response = await fetch(`/api/keberatan/${keberatanId}/responses`, {
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
        

        
        await fetchResponses();
        // Refresh chat list to show updated conversation
        setTimeout(() => {
          window.dispatchEvent(new Event('ppid-chat-updated'));
          localStorage.setItem('chat-refresh', Date.now().toString());
        }, 1000);
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
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/keberatan/${keberatanId}/responses`, {
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
    
    setChatActive(true);
    setCanSendMessage(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/keberatan/${keberatanId}/responses`, {
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

  const loadingPpidRef = useRef(false);
  
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
      
      if (response.status === 429) {
        console.warn('Rate limit reached, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      }
      
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
    if (hasMore && !loadingPpid) {
      fetchPpidList(searchTerm, currentPage + 1);
    }
  };

  const handleForwardClick = () => {
    if (!selectedPpid) return;
    setShowConfirmModal(true);
  };

  const forwardToPpid = async () => {
    if (!selectedPpid) return;
    
    setIsForwarding(true);
    setShowConfirmModal(false);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/assign-ppid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          keberatanId: keberatanId,
          ppidId: selectedPpid.id,
          type: 'keberatan'
        })
      });
      if (response.ok) {
        setShowPpidModal(false);
        setShowSuccessModal(true);
        
        // Trigger notification refresh for the assigned PPID
        window.dispatchEvent(new Event('notification-refresh'));
        localStorage.setItem('notification-refresh', Date.now().toString());
        
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 2000);
      } else {
        alert('Gagal meneruskan keberatan');
      }
    } catch (error) {
      console.error('Failed to forward keberatan:', error);
      alert('Gagal meneruskan keberatan');
    } finally {
      setIsForwarding(false);
    }
  };

  useEffect(() => {
    if (showPpidModal) {
      setSearchTerm('');
      setPpidList([]);
      setCurrentPage(1);
      setHasMore(true);
      const timer = setTimeout(() => fetchPpidList('', 1), 100);
      return () => clearTimeout(timer);
    }
  }, [showPpidModal, fetchPpidList]);

  useEffect(() => {
    if (showPpidModal) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        setPpidList([]);
        fetchPpidList(searchTerm, 1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, showPpidModal, fetchPpidList]);

  useEffect(() => {
    fetchResponses();
    const interval = setInterval(fetchResponses, 3000);
    return () => clearInterval(interval);
  }, [keberatanId, fetchResponses]);

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

  const handleEvidenceSubmit = async (evidenceData: any) => {
    setIsSubmittingEvidence(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/usage-evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evidenceData)
      });

      if (response.ok) {
        setShowEvidenceForm(false);
        alert('Bukti penggunaan informasi berhasil dikirim!');
        fetchResponses();
      } else {
        const errorData = await response.json();
        alert('Gagal mengirim bukti: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting evidence:', error);
      alert('Gagal mengirim bukti. Silakan coba lagi.');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-red-600">Chat Keberatan #{keberatanId}</h3>
        <div className="flex items-center gap-2">
          {!chatActive && (
            <span className="text-sm text-red-600 font-medium">Chat Diakhiri</span>
          )}
          {actualUserRole === 'PEMOHON' && (
            <button
              onClick={() => setShowEvidenceForm(true)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
            >
              <FileCheck className="w-4 h-4" />
              Kirim Bukti Penggunaan
            </button>
          )}
          {(isAdmin || actualUserRole === 'PPID_PELAKSANA' || actualUserRole === 'PPID_UTAMA') && (
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
            console.log('Error parsing attachments:', e);
          }
          const isSystemMessage = resp.message_type === 'system';
          return (
            <div key={resp.id} className={`flex flex-col space-y-2 ${isSystemMessage ? 'items-center' : ''}`}>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(resp.user_role)}`}>
                  {resp.user_role === 'PPID_PELAKSANA' ? (resp.user_name && resp.user_name !== 'Unknown User' ? resp.user_name : 'PPID Pelaksana') : 
                   resp.user_role === 'PPID_UTAMA' ? (resp.user_name && resp.user_name !== 'Unknown User' ? resp.user_name : 'PPID Utama') :
                   resp.user_role === 'ATASAN_PPID' ? (resp.user_name && resp.user_name !== 'Unknown User' ? resp.user_name : 'Atasan PPID') :
                   resp.user_role === 'ADMIN' ? (resp.user_name && resp.user_name !== 'Unknown User' ? resp.user_name : 'Admin') :
                   resp.user_role === 'System' ? 'Sistem' :
                   resp.user_name || resp.user_role}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(resp.created_at).toLocaleString('id-ID')}
                </span>
              </div>
              <div className={`p-3 rounded-lg ${
                isSystemMessage ? 'bg-red-50 border border-red-200 text-center' : 
                resp.message_type === 'evidence' ? 'bg-green-50 border border-green-200' : 
                'bg-gray-50'
              }`}>
                {resp.message && (
                  <p className={`text-gray-800 ${
                    resp.message_type === 'evidence' ? 'font-medium' : ''
                  }`}>
                    {resp.message}
                  </p>
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
        {!chatActive && !isAdmin && actualUserRole !== 'PPID_PELAKSANA' ? (
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
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  !chatActive ? "Chat telah diakhiri" :
                  "Tulis pesan keberatan..."
                }
                className="flex-1 border rounded-lg px-3 py-2"
                onKeyPress={(e) => e.key === 'Enter' && sendResponse()}
                disabled={(actualUserRole === 'PEMOHON' && (!chatActive || !canSendMessage)) || (actualUserRole !== 'PEMOHON' && !chatActive && !['ADMIN', 'PPID_PELAKSANA'].includes(actualUserRole))}
              />
              <button
                onClick={sendResponse}
                disabled={isLoading || (!message.trim() && attachments.length === 0) || (actualUserRole === 'PEMOHON' && !canSendMessage) || (!chatActive && !isAdmin && actualUserRole !== 'PPID_PELAKSANA')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
            <h3 className="text-lg font-semibold mb-4 text-red-600">Teruskan ke PPID Pelaksana</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pilih PPID Pelaksana untuk meneruskan keberatan ini
            </p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari PPID Pelaksana..."
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
              {ppidList.length === 0 && !loadingPpid ? (
                <p className="text-gray-500 text-center py-4">Tidak ada PPID ditemukan</p>
              ) : (
                ppidList.map((ppid) => (
                  <button
                    key={ppid.id}
                    onClick={() => setSelectedPpid(ppid)}
                    className={`w-full flex items-center p-3 border rounded-lg hover:bg-gray-50 text-left ${
                      selectedPpid?.id === ppid.id ? 'bg-red-50 border-red-500' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium">{ppid.nama}</div>
                      <div className="text-sm text-gray-500">{ppid.email}</div>
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
                  setSelectedPpid(null);
                  setSearchTerm('');
                  setPpidList([]);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleForwardClick}
                disabled={!selectedPpid || isForwarding}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isForwarding ? 'Meneruskan...' : 'Teruskan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && selectedPpid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Berhasil Diteruskan!</h3>
              <p className="text-gray-600 mb-4">
                Keberatan berhasil diteruskan ke <span className="font-semibold">{selectedPpid.nama}</span>
              </p>
              <p className="text-sm text-gray-500">
                Anda akan dialihkan ke dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPpid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Konfirmasi Penerusan Keberatan</h3>
            <p className="text-gray-700 mb-2">
              Anda akan meneruskan keberatan ini ke:
            </p>
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-gray-900">{selectedPpid.nama}</p>
              <p className="text-sm text-gray-600">{selectedPpid.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedPpid.role === 'PPID_UTAMA' ? 'PPID Utama' :
                 selectedPpid.role === 'PPID_PELAKSANA' ? 'PPID Pelaksana' :
                 'Atasan PPID'}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin melanjutkan?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={forwardToPpid}
                disabled={isForwarding}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isForwarding ? 'Meneruskan...' : 'Ya, Teruskan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Evidence Form */}
      {showEvidenceForm && (
        <UsageEvidenceForm
          keberatanId={keberatanId}
          onSubmit={handleEvidenceSubmit}
          onCancel={() => setShowEvidenceForm(false)}
          isLoading={isSubmittingEvidence}
        />
      )}
    </div>
  );
}