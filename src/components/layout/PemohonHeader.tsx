"use client";

import { useAuth } from "@/context/AuthContext";
import { getRoleDisplayName } from "@/lib/roleUtils";
import { LogOut, User } from "lucide-react";

const PemohonHeader = () => {
  const { logout, user, getUserRole } = useAuth();
  const userRole = getUserRole();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              PPID Diskominfo Garut
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {getRoleDisplayName(userRole)}
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <User className="h-4 w-4 mr-2" />
              <span>{user?.name || user?.email || "Pemohon"}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PemohonHeader;