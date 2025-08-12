"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isPemohon } from "@/lib/roleUtils";
import PemohonHeader from "@/components/layout/PemohonHeader";

export default function PemohonLayout({
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
      if (!isPemohon(userRole)) {
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
  if (!isPemohon(userRole)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PemohonHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
