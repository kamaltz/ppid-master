// src/app/pemohon/ajukan/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createRequest } from "@/lib/api";

export default function AjukanPermohonanPage() {
  const [formData, setFormData] = useState({
    informasi_diminta: "",
    tujuan: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Anda harus login untuk mengajukan permohonan.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await createRequest(formData, token);
      setSuccess(
        data.message ||
          "Permohonan berhasil dikirim! Anda akan dialihkan ke dasbor."
      );
      setTimeout(() => {
        router.push("/pemohon/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.error || "Terjadi kesalahan saat mengirim permohonan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 mx-auto space-y-6 w-full max-w-2xl bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-dark-text">
        Formulir Pengajuan Permohonan Informasi
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-center text-green-500">{success}</p>
        )}

        <div>
          <label
            htmlFor="informasi_diminta"
            className="block text-sm font-medium text-gray-700"
          >
            Rincian Informasi yang Diminta
          </label>
          <textarea
            name="informasi_diminta"
            rows={4}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="px-3 py-2 mt-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label
            htmlFor="tujuan"
            className="block text-sm font-medium text-gray-700"
          >
            Tujuan Penggunaan Informasi
          </label>
          <textarea
            name="tujuan"
            rows={2}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="px-3 py-2 mt-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-blue-300"
        >
          {isLoading ? "Mengirim..." : "Kirim Permohonan"}
        </button>
      </form>
    </div>
  );
}
