"use client";

import { useState } from "react";
import { AlertCircle, Upload, X } from "lucide-react";

export default function KeberatanPage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    permohonan_asal: '',
    alasan_keberatan: '',
    bukti_pendukung: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi';
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = 'Nama minimal 3 karakter';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.permohonan_asal.trim()) {
      newErrors.permohonan_asal = 'Nomor permohonan asal wajib diisi';
    } else if (!/^REQ\d{3}$/.test(formData.permohonan_asal)) {
      newErrors.permohonan_asal = 'Format nomor permohonan tidak valid (contoh: REQ001)';
    }
    
    if (!formData.alasan_keberatan.trim()) {
      newErrors.alasan_keberatan = 'Alasan keberatan wajib diisi';
    } else if (formData.alasan_keberatan.trim().length < 20) {
      newErrors.alasan_keberatan = 'Alasan keberatan minimal 20 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Keberatan berhasil diajukan dan akan diproses oleh PPID Utama terlebih dahulu!');
      setFormData({ nama: '', email: '', permohonan_asal: '', alasan_keberatan: '', bukti_pendukung: '' });
      setFiles([]);
    } catch (error) {
      alert('Gagal mengajukan keberatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.includes('document');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    setFiles(prev => [...prev, ...validFiles]);
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Pengajuan Keberatan</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Ajukan Keberatan Informasi</h2>
          <p className="text-gray-600 mb-4">
            Jika Anda tidak puas dengan tanggapan atas permohonan informasi, Anda dapat mengajukan keberatan.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Proses Keberatan:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Keberatan akan diterima dan diproses oleh PPID Utama</li>
              <li>2. PPID Utama akan meneruskan ke PPID Pelaksana untuk ditindaklanjuti</li>
              <li>3. PPID Pelaksana akan memberikan tanggapan akhir</li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
            <input 
              type="text" 
              value={formData.nama}
              onChange={(e) => handleChange('nama', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.nama ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
              }`}
            />
            {errors.nama && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.nama}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
              }`}
            />
            {errors.email && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Permohonan Asal *</label>
            <input 
              type="text" 
              value={formData.permohonan_asal}
              onChange={(e) => handleChange('permohonan_asal', e.target.value)}
              placeholder="REQ001"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.permohonan_asal ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
              }`}
            />
            {errors.permohonan_asal && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.permohonan_asal}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Keberatan *</label>
            <textarea 
              rows={4} 
              value={formData.alasan_keberatan}
              onChange={(e) => handleChange('alasan_keberatan', e.target.value)}
              placeholder="Jelaskan alasan keberatan Anda..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.alasan_keberatan ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
              }`}
            />
            {errors.alasan_keberatan && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.alasan_keberatan}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bukti Pendukung</label>
            <textarea 
              rows={3} 
              value={formData.bukti_pendukung}
              onChange={(e) => handleChange('bukti_pendukung', e.target.value)}
              placeholder="Lampirkan bukti atau dokumen pendukung jika ada..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Pendukung</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Klik untuk upload file</span>
                <span className="text-xs text-gray-400">Gambar, PDF, DOC (Max 5MB)</span>
              </label>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg"
          >
            {isSubmitting ? 'Mengajukan...' : 'Ajukan Keberatan'}
          </button>
        </form>
      </div>
    </div>
  );
}