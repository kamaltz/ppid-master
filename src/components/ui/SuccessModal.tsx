"use client";

import { CheckCircle, X } from "lucide-react";

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
  message
}: SuccessModalProps) {
  if (!isOpen) return <div style={{display: 'none'}} />;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300" style={{display: isOpen ? 'flex' : 'none'}}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-b border-green-200 px-6 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="animate-in zoom-in duration-500 delay-100">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-green-800">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-1 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-6">
          <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 text-base leading-relaxed text-center">{message}</p>
        </div>
        
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              OK
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}