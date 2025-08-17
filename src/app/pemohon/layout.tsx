"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isPemohon } from "@/lib/roleUtils";
import PemohonHeader from "@/components/layout/PemohonHeader";
import PemohonSidebar from "@/components/layout/PemohonSidebar";

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
      <div className="flex">
        <PemohonSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
