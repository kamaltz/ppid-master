"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRoleDisplayName } from "@/lib/roleUtils";

interface AccessDeniedProps {
  userRole: string | null;
  requiredRoles?: string[];
  message?: string;
}

const AccessDenied = ({ 
  userRole, 
  requiredRoles = [], 
  message = "Anda tidak memiliki akses ke halaman ini." 
}: AccessDeniedProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">{message}</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Role Anda:</strong> {getRoleDisplayName(userRole)}
            </p>
            {requiredRoles.length > 0 && (
              <p className="text-sm text-gray-700">
                <strong>Role yang Diperlukan:</strong> {requiredRoles.map(role => getRoleDisplayName(role)).join(", ")}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/dashboard"
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Link>
          
          <Link 
            href="/"
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;