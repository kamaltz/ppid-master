// src/app/admin/layout.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdminRole } from "@/lib/roleUtils";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading, getUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push("/login");
        return;
      }
      
      const userRole = getUserRole();
      if (!isAdminRole(userRole)) {
        router.push("/dashboard");
        return;
      }
    }
  }, [token, loading, router, getUserRole]);

  if (loading || !token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const userRole = getUserRole();
  if (!isAdminRole(userRole)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  // Jika token ada, tampilkan layout admin
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
