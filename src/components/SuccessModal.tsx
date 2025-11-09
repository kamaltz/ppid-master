// src/components/SuccessModal.tsx
"use client";

import { CheckCircle } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-300">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 mb-6 animate-in zoom-in duration-500 delay-200">
            <CheckCircle className="w-12 h-12 text-green-600 animate-in zoom-in duration-700 delay-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
          <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Lanjutkan ke Dashboard
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
