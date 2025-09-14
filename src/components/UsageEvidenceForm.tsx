"use client";

import { useState, useRef } from 'react';
import { Send, Paperclip, X, Link as LinkIcon } from 'lucide-react';

interface UsageEvidenceFormProps {
  requestId?: number;
  keberatanId?: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function UsageEvidenceForm({ 
  requestId, 
  keberatanId, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: UsageEvidenceFormProps) {
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Deskripsi penggunaan wajib diisi');
      return;
    }
    
    if (attachments.length === 0) {
      alert('File lampiran wajib dilampirkan');
      return;
    }

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
          uploadedFiles.push({ 
            name: result.originalName || result.filename, 
            url: result.url, 
            size: result.size 
          });
        }
      }

      onSubmit({
        request_id: requestId,
        keberatan_id: keberatanId,
        description: description.trim(),
        attachments: uploadedFiles,
        links: links.trim()
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Gagal mengupload file. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">
          📋 Lampirkan Bukti Penggunaan Informasi
        </h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-700 mb-2">
            <strong>Wajib melampirkan bukti penggunaan informasi sesuai tujuan yang telah disebutkan dalam permohonan.</strong>
          </p>
          <p className="text-xs text-blue-600">
            Deskripsi penggunaan dan file lampiran wajib diisi. Link bersifat opsional sebagai pendukung.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Penggunaan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan bagaimana informasi telah digunakan..."
              className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500 karakter</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link/URL (Opsional)
            </label>
            <div className="flex items-center">
              <LinkIcon className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="url"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder="https://contoh.com/hasil-penelitian"
                className="flex-1 border rounded-lg px-3 py-2"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Link ke publikasi, website, atau dokumen online
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Lampiran <span className="text-red-500">*</span>
            </label>
            
            {attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
              onChange={(e) => {
                if (e.target.files) {
                  setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                }
              }}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Pilih File
            </button>
            
            <p className="text-xs text-gray-500 mt-1">
              Format: PDF, DOC, XLS, gambar, ZIP (Max 10MB per file)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !description.trim() || attachments.length === 0}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Mengirim...' : 'Kirim Bukti'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}