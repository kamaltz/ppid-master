"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createRequest } from "@/lib/api";
import Link from "next/link";
import { LogIn, UserPlus, AlertCircle, Upload, X } from "lucide-react";

export default function PermohonanPage() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    rincian_informasi: '',
    tujuan_penggunaan: '',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Email'
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.rincian_informasi.trim()) {
      newErrors.rincian_informasi = 'Rincian informasi wajib diisi';
    } else if (formData.rincian_informasi.trim().length < 10) {
      newErrors.rincian_informasi = 'Rincian informasi minimal 10 karakter';
    }
    
    if (!formData.tujuan_penggunaan.trim()) {
      newErrors.tujuan_penggunaan = 'Tujuan penggunaan wajib diisi';
    } else if (formData.tujuan_penggunaan.trim().length < 5) {
      newErrors.tujuan_penggunaan = 'Tujuan penggunaan minimal 5 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submit-prisma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rincian_informasi: formData.rincian_informasi,
          tujuan_penggunaan: formData.tujuan_penggunaan,
          cara_memperoleh_informasi: formData.cara_memperoleh_informasi || 'Email',
          cara_mendapat_salinan: formData.cara_mendapat_salinan || 'Email'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to submit request');
      }

      alert('Permohonan berhasil dikirim dan akan diproses oleh PPID!');
      setFormData({
        rincian_informasi: '',
        tujuan_penggunaan: '',
        cara_memperoleh_informasi: 'Email',
        cara_mendapat_salinan: 'Email'
      });
      setFiles([]);
      setErrors({});
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert(error.message || 'Gagal mengirim permohonan. Silakan coba lagi.');
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Rincian Informasi yang Diminta *</label>
            <textarea 
              rows={4} 
              value={formData.rincian_informasi}
              onChange={(e) => handleChange('rincian_informasi', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.rincian_informasi ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
              }`}
              placeholder="Jelaskan informasi yang Anda butuhkan secara detail..."
            />
            {errors.rincian_informasi && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.rincian_informasi}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tujuan Penggunaan Informasi *</label>
            <textarea 
              rows={3} 
              value={formData.tujuan_penggunaan}
              onChange={(e) => handleChange('tujuan_penggunaan', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.tujuan_penggunaan ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
              }`}
              placeholder="Jelaskan untuk apa informasi ini akan digunakan..."
            />
            {errors.tujuan_penggunaan && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.tujuan_penggunaan}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cara Memperoleh Informasi *</label>
            <select 
              value={formData.cara_memperoleh_informasi}
              onChange={(e) => handleChange('cara_memperoleh_informasi', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="Melihat/Membaca">Melihat/Membaca</option>
              <option value="Mendapat Salinan">Mendapat Salinan</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cara Mendapat Salinan *</label>
            <select 
              value={formData.cara_mendapat_salinan}
              onChange={(e) => handleChange('cara_mendapat_salinan', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="Mengambil Langsung">Mengambil Langsung</option>
              <option value="Email">Email</option>
              <option value="Pos">Pos</option>
              <option value="Fax">Fax</option>
            </select>
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