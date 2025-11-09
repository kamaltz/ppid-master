"use client";

import { useState, useCallback } from "react";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info" | "confirm";
  onConfirm?: () => void;
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showModal = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "info",
      title?: string
    ) => {
      const defaultTitles = {
        success: "✅ Berhasil",
        error: "❌ Gagal",
        warning: "⚠️ Peringatan",
        info: "ℹ️ Informasi",
        confirm: "❓ Konfirmasi",
      };

      setModalState({
        isOpen: true,
        title: title || defaultTitles[type],
        message,
        type,
      });
    },
    []
  );

  const showConfirm = useCallback(
    (message: string, onConfirm: () => void, title?: string) => {
      setModalState({
        isOpen: true,
        title: title || "❓ Konfirmasi",
        message,
        type: "confirm",
        onConfirm,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalState,
    showModal,
    showConfirm,
    closeModal,
  };
}
