"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SuccessModal from "@/components/SuccessModal";
import { useRouter, useSearchParams } from "next/navigation";

export default function KeberatanPage() {
  const [formData, setFormData] = useState({
    permintaan_id: "",
    judul: "",
    alasan_keberatan: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [permintaanList, setPermintaanList] = useState<any[]>([]);
  const [isLoadingPermintaan, setIsLoadingPermintaan] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchPermintaan();
    const permintaanId = searchParams.get("permintaan_id");
    if (permintaanId) {
      setFormData((prev) => ({ ...prev, permintaan_id: permintaanId }));
    }
  }, [searchParams]);

  const fetchPermintaan = async () => {
    if (!token) return;
    setIsLoadingPermintaan(true);
    try {
      const response = await fetch("/api/permintaan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setPermintaanList(data.data);
      } else if (data.data) {
        setPermintaanList(data.data);
      } else {
        setPermintaanList([]);
      }
    } catch (error) {
      console.error("Failed to fetch permintaan:", error);
      setPermintaanList([]);
    } finally {
      setIsLoadingPermintaan(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.permintaan_id) {
      newErrors.permintaan_id =
        "Pilih permohonan yang ingin diajukan keberatan";
    }

    if (!formData.judul.trim()) {
      newErrors.judul = "Judul keberatan wajib diisi";
    }
    
    if (!formData.alasan_keberatan.trim()) {
      newErrors.alasan_keberatan = "Alasan keberatan wajib diisi";
    } else if (formData.alasan_keberatan.trim().length < 20) {
      newErrors.alasan_keberatan = "Alasan keberatan minimal 20 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !token) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/keberatan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccessModal(true);
        setFormData({ permintaan_id: "", judul: "", alasan_keberatan: "" });
      } else {
        console.error('API Error:', data);
        setErrors({ general: data.error || "Gagal mengajukan keberatan" });
      }
    } catch (error) {
      setErrors({ general: "Terjadi kesalahan saat mengajukan keberatan" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Pengajuan Keberatan
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Ajukan Keberatan Informasi
          </h2>
          <p className="text-gray-600 mb-4">
            Jika Anda tidak puas dengan tanggapan atas permohonan informasi,
            Anda dapat mengajukan keberatan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.general}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Permohonan *
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Pilih permohonan yang ingin diajukan keberatan.
            </p>
            <select
              value={formData.permintaan_id}
              onChange={(e) => handleChange("permintaan_id", e.target.value)}
              disabled={isLoadingPermintaan}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.permintaan_id
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-800"
              } ${isLoadingPermintaan ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">
                {isLoadingPermintaan
                  ? "Memuat permohonan..."
                  : "Pilih permohonan yang ingin diajukan keberatan"}
              </option>
              {permintaanList.length > 0
                ? permintaanList.map((item) => {
                    let displayStatus = item.status;
                    if (item.status === "Diverifikasi")
                      displayStatus = "Di Verifikasi PPID Utama";
                    if (item.status === "Diproses")
                      displayStatus = "Diproses PPID Pelaksana";

                    return (
                      <option key={item.id} value={item.id}>
                        #{item.id} - {item.judul || item.rincian_informasi.substring(0, 30)}
                        ... - ({displayStatus})
                      </option>
                    );
                  })
                : !isLoadingPermintaan && (
                    <option value="" disabled>
                      Tidak ada permohonan tersedia
                    </option>
                  )}
            </select>
            {errors.permintaan_id && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.permintaan_id}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Keberatan *
            </label>
            <input
              type="text"
              value={formData.judul}
              onChange={(e) => handleChange("judul", e.target.value)}
              placeholder="Masukkan judul keberatan..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.judul
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-800"
              }`}
            />
            {errors.judul && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.judul}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Keberatan *
            </label>
            <textarea
              rows={4}
              value={formData.alasan_keberatan}
              onChange={(e) => handleChange("alasan_keberatan", e.target.value)}
              placeholder="Jelaskan alasan keberatan Anda..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.alasan_keberatan
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-800"
              }`}
            />
            {errors.alasan_keberatan && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.alasan_keberatan}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg"
          >
            {isSubmitting ? "Mengajukan..." : "Ajukan Keberatan"}
          </button>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/pemohon/dashboard");
        }}
        title="Keberatan Berhasil Diajukan"
      />
    </div>
  );
}
