// src/app/pemohon/ajukan/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createRequest } from "@/lib/api";
import ConfirmationModal from "@/components/ConfirmationModal";
import SuccessModal from "@/components/SuccessModal";

export default function AjukanPermohonanPage() {
  const [formData, setFormData] = useState({
    informasi_diminta: "",
    tujuan: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Anda harus login untuk mengajukan permohonan.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setShowConfirmModal(false);

    try {
      await createRequest(formData, token!);
      setShowSuccessModal(true);
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

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Pengajuan"
        message="Apakah Anda yakin ingin mengajukan permohonan informasi ini?"
        confirmText="Ya, Kirim"
        isLoading={isLoading}
      />
      
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/pemohon/dashboard");
        }}
        title="🎉 Berhasil Dikirim!"
        message="Permohonan berhasil dikirim dan akan diproses oleh PPID!"
      />
    </div>
  );
}
