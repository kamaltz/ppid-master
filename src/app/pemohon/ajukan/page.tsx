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
    rincian_informasi: "",
    tujuan_penggunaan: "",
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
    } catch (err: unknown) {
      setError(
        (err as { error?: string })?.error || "Terjadi kesalahan saat mengirim permohonan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 mx-auto space-y-6 w-full max-w-2xl bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-dark-text">
        Formulir Pengajuan Permohonan Informasi
      </h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Kewajiban Pelaporan</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p><strong>WAJIB:</strong> Melaporkan bukti hasil penggunaan informasi yang diperoleh kepada PPID setelah informasi digunakan, sesuai dengan ketentuan yang berlaku.</p>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-center text-red-500">{error}</p>}

        <div>
          <label
            htmlFor="rincian_informasi"
            className="block text-sm font-medium text-gray-700"
          >
            Rincian Informasi yang Diminta
          </label>
          <textarea
            name="rincian_informasi"
            rows={4}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="px-3 py-2 mt-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label
            htmlFor="tujuan_penggunaan"
            className="block text-sm font-medium text-gray-700"
          >
            Tujuan Penggunaan Informasi
          </label>
          <textarea
            name="tujuan_penggunaan"
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
