"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info" | "confirm";
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Batal",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "error":
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      case "confirm":
        return <AlertTriangle className="w-12 h-12 text-blue-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 animate-in zoom-in duration-500 delay-100">{getIcon()}</div>
            <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
          {type === "confirm" && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium transform hover:scale-105"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 text-white rounded-xl transition-all duration-200 font-medium transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 ${getButtonColor()} ${type === 'success' ? 'focus:ring-green-200' : type === 'error' ? 'focus:ring-red-200' : type === 'warning' ? 'focus:ring-yellow-200' : 'focus:ring-blue-200'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
