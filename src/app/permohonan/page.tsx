"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { LogIn, UserPlus, AlertCircle, Upload, X } from "lucide-react";

export default function PermohonanPage() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    informasi: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama lengkap wajib diisi';
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = 'Nama minimal 3 karakter';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.informasi.trim()) {
      newErrors.informasi = 'Informasi yang diminta wajib diisi';
    } else if (formData.informasi.trim().length < 10) {
      newErrors.informasi = 'Deskripsi informasi minimal 10 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Permohonan berhasil dikirim dan akan diproses oleh PPID Utama terlebih dahulu!');
      setFormData({ nama: '', email: '', informasi: '' });
      setFiles([]);
      setErrors({});
    } catch (error) {
      alert('Gagal mengirim permohonan');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Permohonan Informasi</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Login Diperlukan</h2>
          <p className="text-gray-600 mb-8">
            Untuk mengajukan permohonan informasi publik, Anda harus login terlebih dahulu sebagai pemohon.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <button className="flex items-center px-6 py-3 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg">
                <LogIn className="mr-2 w-5 h-5" />
                Login
              </button>
            </Link>
            
            <Link href="/register">
              <button className="flex items-center px-6 py-3 border border-blue-800 text-blue-800 hover:bg-blue-50 font-semibold rounded-lg">
                <UserPlus className="mr-2 w-5 h-5" />
                Daftar Akun
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Permohonan Informasi</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6">Ajukan Permohonan Informasi Publik</h2>
        
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
              placeholder="Masukkan nama lengkap"
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
              placeholder="contoh@email.com"
            />
            {errors.email && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Informasi yang Diminta *</label>
            <textarea 
              rows={4} 
              value={formData.informasi}
              onChange={(e) => handleChange('informasi', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.informasi ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
              }`}
              placeholder="Jelaskan informasi yang Anda butuhkan secara detail..."
            />
            {errors.informasi && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.informasi}
              </div>
            )}
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
                id="file-upload-permohonan"
              />
              <label htmlFor="file-upload-permohonan" className="cursor-pointer flex flex-col items-center">
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
          
          <div className="text-sm text-gray-600 mb-4">
            * Field wajib diisi
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-800 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Permohonan'}
          </button>
        </form>
      </div>
    </div>
  );
}