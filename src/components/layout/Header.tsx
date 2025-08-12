"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  Info,
  LogIn,
  LogOut,
  Scale,
  Search,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (!token) return "/login";
    
    const userRole = localStorage.getItem("user_role");
    if (userRole === "Admin" || userRole === "PPID" || userRole === "Atasan_PPID") {
      return "/admin/dashboard";
    } else if (userRole === "Pemohon") {
      return "/pemohon/dashboard";
    }
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container flex justify-between items-center px-4 py-3 mx-auto">
        {/* Logo & Title */}
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/logo-garut.svg" alt="Logo PPID" width={40} height={40} />
          <div>
            <h1 className="text-lg font-bold text-blue-800">PPID Diskominfo</h1>
            <p className="text-xs text-gray-500">Kabupaten Garut</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors">
            <Home className="mr-2 h-4 w-4" /> Beranda
          </Link>
          <Link href="/profil" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors">
            <Info className="mr-2 h-4 w-4" /> Profil PPID
          </Link>
          <Link href="/permohonan" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors">
            <Scale className="mr-2 h-4 w-4" /> Permohonan
          </Link>
          <Link href="/dip" className="flex items-center text-gray-600 hover:text-blue-800 transition-colors">
            <BarChart3 className="mr-2 h-4 w-4" /> DIP
          </Link>
        </nav>

        {/* Search & Login/Logout */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari informasi..."
              className="border rounded-full py-1.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-400 hover:text-blue-800" />
            </button>
          </form>

          {token ? (
            <>
              <Link href={getDashboardLink()}>
                <button className="flex items-center px-4 py-2 font-semibold bg-gray-100 rounded-full transition-colors hover:bg-gray-200 text-gray-800">
                  <User className="mr-2 w-4 h-4" />
                  Dashboard
                </button>
              </Link>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 font-semibold text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
              >
                <LogOut className="mr-2 w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register">
                <button className="px-4 py-2 font-semibold text-blue-800">
                  Daftar
                </button>
              </Link>
              <Link href="/login">
                <button className="flex items-center px-4 py-2 font-semibold text-white rounded-full transition-colors bg-blue-800 hover:bg-blue-600">
                  <LogIn className="mr-2 w-4 h-4" />
                  Login
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
