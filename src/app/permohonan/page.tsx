"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

import Link from "next/link";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function PermohonanPage() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    judul: '',
    rincian_informasi: '',
    tujuan_penggunaan: '',
    cara_memperoleh_informasi: 'Email',
    cara_mendapat_salinan: 'Email'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [isLoadingLimit, setIsLoadingLimit] = useState(true);
  
  const fetchDailyCount = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/permintaan?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const today = new Date().toDateString();
        const todayCount = data.data.filter((req: any) => 
          new Date(req.created_at).toDateString() === today
        ).length;
        setDailyCount(todayCount);
      }
    } catch (error) {
      console.error('Failed to fetch daily count:', error);
    } finally {
      setIsLoadingLimit(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDailyCount();
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.judul.trim()) {
      newErrors.judul = 'Judul permohonan wajib diisi';
    }
    
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
    
    setShowConfirmation(true);
  };
  
  const confirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/permintaan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          judul: formData.judul,
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
        judul: '',
        rincian_informasi: '',
        tujuan_penggunaan: '',
        cara_memperoleh_informasi: 'Email',
        cara_mendapat_salinan: 'Email'
      });
      setErrors({});
    } catch (error: unknown) {
      console.error('Error submitting request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim permohonan. Silakan coba lagi.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const cancelSubmit = () => {
    setShowConfirmation(false);
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informasi Batas Harian</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• Maksimal 5 permohonan per hari</p>
                <p>• Setiap permohonan akan diproses sesuai ketentuan yang berlaku</p>
                {!isLoadingLimit && (
                  <p className="font-medium mt-1">
                    Hari ini: {dailyCount}/5 permohonan
                    {dailyCount >= 5 && <span className="text-red-600 ml-2">(Batas tercapai)</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Date Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Tanggal Pengajuan</p>
              <p className="text-sm text-blue-600">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Judul Permohonan *</label>
            <input
              type="text"
              value={formData.judul}
              onChange={(e) => handleChange('judul', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.judul ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
              }`}
              placeholder="Masukkan judul permohonan..."
            />
            {errors.judul && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.judul}
              </div>
            )}
          </div>
          
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
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Konfirmasi Permohonan</h3>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Rincian Informasi:</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                  {formData.rincian_informasi.substring(0, 100)}{formData.rincian_informasi.length > 100 ? '...' : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tujuan Penggunaan:</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                  {formData.tujuan_penggunaan.substring(0, 100)}{formData.tujuan_penggunaan.length > 100 ? '...' : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tanggal Pengajuan:</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin data permohonan sudah sesuai dan ingin mengirimkannya?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelSubmit}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}