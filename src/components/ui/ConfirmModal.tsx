"use client";

import { AlertTriangle, CheckCircle, X, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return <div style={{display: 'none'}} />;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="w-12 h-12 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          button: 'bg-red-600 hover:bg-red-700',
          text: 'text-red-800'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          button: 'bg-green-600 hover:bg-green-700',
          text: 'text-green-800'
        };
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          text: 'text-yellow-800'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200" style={{display: isOpen ? 'flex' : 'none'}}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-300">
        <div className={`${colors.bg} ${colors.border} border-b px-6 py-5 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="animate-in zoom-in duration-500 delay-100">{getIcon()}</div>
              <h3 className={`text-xl font-bold ${colors.text}`}>{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-1 transition-all duration-200"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-6">
          <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        </div>
        
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 ${colors.button} ${type === 'danger' ? 'focus:ring-red-200' : type === 'success' ? 'focus:ring-green-200' : 'focus:ring-yellow-200'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Memproses...
              </div>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}