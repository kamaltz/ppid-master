"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole, isPemohon } from "@/lib/roleUtils";

export default function DashboardPage() {
  const { token, loading, getUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push("/login");
        return;
      }

      const userRole = getUserRole();
      
      if (isAdminRole(userRole)) {
        router.push("/admin/dashboard");
      } else if (isPemohon(userRole)) {
        router.push("/pemohon/dashboard");
      } else {
        localStorage.clear();
        router.push("/login");
      }
    }
  }, [token, loading, router, getUserRole]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
