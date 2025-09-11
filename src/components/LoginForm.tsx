// src/components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Toast from "@/components/ui/Toast";

const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [registrationDate, setRegistrationDate] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      // Check if it's a pending approval error
      if (err instanceof Error && err.message.includes('proses persetujuan')) {
        setIsPendingApproval(true);
        // Try to extract registration date from error response if available
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await response.json();
          if (data.registrationDate) {
            setRegistrationDate(data.registrationDate);
          }
        } catch {
          // Ignore error, just show basic message
        }
        // Don't show toast for pending approval, keep persistent message
        setShowToast(false);
      } else {
        setIsPendingApproval(false);
        setShowToast(true);
      }
      
      const errorMessage = err instanceof Error ? err.message : "Login gagal. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showToast && error && (
        <Toast
          message={error}
          type="error"
          onClose={() => {
            setShowToast(false);
            setError(null);
          }}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tampilkan pesan error jika ada */}
      {error && (
        <div
          className={`px-4 py-3 rounded-lg relative ${
            isPendingApproval 
              ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
          role="alert"
        >
          <div className="flex items-start space-x-2">
            {isPendingApproval && (
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <div>
              <span className="block sm:inline font-medium">
                {isPendingApproval ? 'Akun Menunggu Persetujuan' : 'Login Gagal'}
              </span>
              <p className="text-sm mt-1">{error}</p>
              {isPendingApproval && registrationDate && (
                <p className="text-xs mt-2 opacity-75">
                  Tanggal pendaftaran: {new Date(registrationDate).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error && !isPendingApproval) setError(null);
          }}
          required
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
          }`}
          placeholder="Masukkan email"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error && !isPendingApproval) setError(null);
            }}
            required
            disabled={isLoading}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-800'
            }`}
            placeholder="Masukkan password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Memproses...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-5 w-5" />
            Login
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Lupa password?{" "}
          <a href="#" className="text-blue-800 hover:underline font-medium">
            Hubungi Administrator
          </a>
        </p>
      </div>
    </form>
    </>
  );
};

export default LoginForm;
