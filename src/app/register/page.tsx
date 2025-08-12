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
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: {[key: string]: string} = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setSuccess(null);

    try {
      const { confirmPassword, ...submitData } = formData;
      const data = await registerUser(submitData);
      setSuccess(
        data.message ||
          "Registrasi berhasil! Anda akan dialihkan ke halaman login."
      );
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && <p className="text-sm text-center text-red-500">{errors.submit}</p>}
          {success && (
            <p className="text-sm text-center text-green-500">{success}</p>
          )}

          {/* Input untuk nama, nik, email, password */}
          <div>
            <label
              htmlFor="nama"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="nik"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
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

          <button
            type="submit"
            disabled={isLoading || Object.values(errors).some(error => error !== '')}
            className="w-full bg-blue-800 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-800 hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
