// src/components/SuccessModal.tsx
"use client";

import { CheckCircle, FileText } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm text-blue-600 font-medium">Permohonan Informasi</span>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Lanjutkan ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}