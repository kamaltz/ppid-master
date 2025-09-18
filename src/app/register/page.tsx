// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    email: "",
    password: "",
    confirmPassword: "",
    no_telepon: "",
    alamat: "",
    pekerjaan: "",
    ktp_image: null as File | null
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'nama':
        if (value.length < 3) return 'Nama minimal 3 karakter';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Nama hanya boleh huruf dan spasi';
        break;
      case 'nik':
        if (!/^\d{16}$/.test(value)) return 'NIK harus 16 digit angka';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid';
        break;
      case 'password':
        if (value.length < 6) return 'Password minimal 6 karakter';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Password harus mengandung huruf besar, kecil, dan angka';
        break;
      case 'confirmPassword':
        if (value !== formData.password) return 'Konfirmasi password tidak cocok';
        break;
    }
    return '';
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, ktp_image: 'File harus berupa gambar' }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, ktp_image: 'Ukuran file maksimal 5MB' }));
      return;
    }
    
    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file);
      setFormData(prev => ({ ...prev, ktp_image: compressedFile }));
      setKtpPreview(URL.createObjectURL(compressedFile));
      setErrors(prev => ({ ...prev, ktp_image: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, ktp_image: 'Gagal memproses gambar' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    const requiredFields = ['nama', 'nik', 'email', 'password', 'confirmPassword'];
    requiredFields.forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    
    // Validate KTP image is required
    if (!formData.ktp_image) {
      newErrors.ktp_image = 'Foto KTP wajib diunggah untuk syarat administrasi';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setSuccess(null);

    try {
      const { confirmPassword, ktp_image, ...submitData } = formData;
      
      // Upload KTP image (required)
      if (!ktp_image) {
        setErrors({ ktp_image: 'Foto KTP wajib diunggah untuk syarat administrasi' });
        return;
      }
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', ktp_image);
      
      const uploadResponse = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload
      });
      
      if (!uploadResponse.ok) {
        setErrors({ ktp_image: 'Gagal mengunggah foto KTP. Silakan coba lagi.' });
        return;
      }
      
      const uploadResult = await uploadResponse.json();
      const ktpImageUrl = uploadResult.url;
      
      const finalData = {
        ...submitData,
        ktp_image: ktpImageUrl
      };
      
      const data = await registerUser(finalData);
      setSuccess(data.message || "Registrasi berhasil! Anda akan dialihkan ke halaman login.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi.";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="p-8 space-y-6 w-full max-w-lg bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Daftar Akun Pemohon
        </h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Persyaratan Administrasi:</span> Foto KTP wajib diunggah untuk verifikasi identitas.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && <p className="text-sm text-center text-red-500">{errors.submit}</p>}
          {success && <p className="text-sm text-center text-green-500">{success}</p>}

          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`px-3 py-2 mt-1 w-full rounded-lg border focus:outline-none focus:ring-2 ${
                errors.nama ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Masukkan nama lengkap"
            />
            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
          </div>

          <div>
            <label htmlFor="nik" className="block text-sm font-medium text-gray-700">
              NIK
            </label>
            <input
              type="text"
              name="nik"
              value={formData.nik}
              onChange={handleChange}
              required
              disabled={isLoading}
              maxLength={16}
              className={`px-3 py-2 mt-1 w-full rounded-lg border focus:outline-none focus:ring-2 ${
                errors.nik ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="16 digit NIK"
            />
            {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`px-3 py-2 mt-1 w-full rounded-lg border focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="contoh@email.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`px-3 py-2 mt-1 w-full rounded-lg border focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Minimal 6 karakter"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Konfirmasi Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`px-3 py-2 mt-1 w-full rounded-lg border focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Ulangi password"
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label htmlFor="no_telepon" className="block text-sm font-medium text-gray-700">
              No. Telepon (Opsional)
            </label>
            <input
              type="tel"
              name="no_telepon"
              value={formData.no_telepon}
              onChange={handleChange}
              disabled={isLoading}
              className="px-3 py-2 mt-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">
              Pekerjaan/Profesi (Opsional)
            </label>
            <input
              type="text"
              name="pekerjaan"
              value={formData.pekerjaan}
              onChange={handleChange}
              disabled={isLoading}
              className="px-3 py-2 mt-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: PNS, Swasta, Wiraswasta"
            />
          </div>

          <div>
            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
              Alamat (Opsional)
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              disabled={isLoading}
              rows={2}
              className="px-3 py-2 mt-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          <div>
            <label htmlFor="ktp_image" className="block text-sm font-medium text-gray-700">
              Foto KTP <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="file"
                id="ktp_image"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                disabled={isLoading || isUploading}
                required
                className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                  errors.ktp_image ? 'border-red-300' : ''
                }`}
              />
              {isUploading && (
                <p className="text-xs text-blue-500 mt-1">Memproses gambar...</p>
              )}
              {errors.ktp_image && (
                <p className="text-xs text-red-500 mt-1">{errors.ktp_image}</p>
              )}
              {ktpPreview && (
                <div className="mt-2">
                  <img
                    src={ktpPreview}
                    alt="Preview KTP"
                    className="w-full max-w-xs h-auto rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setKtpPreview(null);
                      setFormData(prev => ({ ...prev, ktp_image: null }));
                    }}
                    className="mt-1 text-xs text-red-600 hover:text-red-800"
                  >
                    Hapus gambar
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-red-600 font-medium">Wajib:</span> Upload foto KTP untuk syarat administrasi. Format: JPG, PNG. Maksimal 5MB. Gambar akan dikompres otomatis.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Mendaftar...' : 'Daftar'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Login di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}