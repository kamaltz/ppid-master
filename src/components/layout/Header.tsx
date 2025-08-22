"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/hooks/useSettings";

interface DropdownItem {
  label: string;
  url: string;
}

interface MenuItem {
  label: string;
  url: string;
  hasDropdown: boolean;
  dropdownItems: DropdownItem[];
}

const Header = () => {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, refetch: refetchSettings } = useSettings();
  
  // Listen for settings changes and refetch
  useEffect(() => {
    const handleSettingsChange = () => {
      refetchSettings();
    };
    
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, [refetchSettings]);
  

  
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
        <Link href="/" className="flex items-center space-x-2 md:space-x-3">
          <Image 
            src={settings?.general?.logo && settings.general.logo.startsWith('/') ? settings.general.logo : "/logo-garut.svg"} 
            alt="Logo" 
            width={32} 
            height={32}
            className="md:w-10 md:h-10 object-contain"
          />
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-lg font-bold text-blue-800 truncate max-w-[200px] md:max-w-none">
              {settings?.general?.namaInstansi || "PPID Diskominfo"}
            </h1>
            <p className="text-xs text-gray-500">Kabupaten Garut</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {(settings?.header?.menuItems && settings.header.menuItems.length > 0) ? 
            settings.header.menuItems.map((item: MenuItem, index: number) => (
              <div key={`${item.label}-${index}`} className="relative group">
                {item.hasDropdown ? (
                  <>
                    <button className="flex items-center text-gray-600 hover:text-blue-800 transition-colors">
                      {item.label}
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        {item.dropdownItems?.map((dropItem: DropdownItem, dropIndex: number) => (
                          <Link
                            key={`${dropItem.label}-${dropIndex}`}
                            href={dropItem.url}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                          >
                            {dropItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={item.url} className="flex items-center text-gray-600 hover:text-blue-800 transition-colors">
                    {item.label}
                  </Link>
                )}
              </div>
            )) : (
              <>
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
              </>
            )
          }
        </nav>

        {/* Mobile Menu Button & Desktop Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search - Hidden on mobile */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari informasi..."
              className="border rounded-full py-1.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800 w-48"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-400 hover:text-blue-800" />
            </button>
          </form>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {token ? (
              <>
                <Link href={getDashboardLink()}>
                  <button className="flex items-center px-3 py-2 text-sm font-semibold bg-gray-100 rounded-full transition-colors hover:bg-gray-200 text-gray-800">
                    <User className="mr-1 w-4 h-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
                >
                  <LogOut className="mr-1 w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/register">
                  <button className="px-3 py-2 text-sm font-semibold text-blue-800">
                    Daftar
                  </button>
                </Link>
                <Link href="/login">
                  <button className="flex items-center px-3 py-2 text-sm font-semibold text-white rounded-full transition-colors bg-blue-800 hover:bg-blue-600">
                    <LogIn className="mr-1 w-4 h-4" />
                    Login
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari informasi..."
                className="w-full border rounded-lg py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400" />
              </button>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {(settings?.header?.menuItems && settings.header.menuItems.length > 0) ?
                settings.header.menuItems.map((item: MenuItem, index: number) => (
                  <div key={`mobile-${item.label}-${index}`}>
                    {item.hasDropdown ? (
                      <div className="space-y-1">
                        <div className="font-medium text-gray-800 py-2">{item.label}</div>
                        <div className="pl-4 space-y-1">
                          {item.dropdownItems?.map((dropItem: DropdownItem, dropIndex: number) => (
                            <Link
                              key={`mobile-${dropItem.label}-${dropIndex}`}
                              href={dropItem.url}
                              className="block py-2 text-sm text-gray-600 hover:text-blue-800"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {dropItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.url}
                        className="block py-2 text-gray-600 hover:text-blue-800"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                )) : (
                  <>
                    <Link href="/" className="flex items-center py-2 text-gray-600 hover:text-blue-800" onClick={() => setIsMobileMenuOpen(false)}>
                      <Home className="mr-2 h-4 w-4" /> Beranda
                    </Link>
                    <Link href="/profil" className="flex items-center py-2 text-gray-600 hover:text-blue-800" onClick={() => setIsMobileMenuOpen(false)}>
                      <Info className="mr-2 h-4 w-4" /> Profil PPID
                    </Link>
                    <Link href="/permohonan" className="flex items-center py-2 text-gray-600 hover:text-blue-800" onClick={() => setIsMobileMenuOpen(false)}>
                      <Scale className="mr-2 h-4 w-4" /> Permohonan
                    </Link>
                    <Link href="/dip" className="flex items-center py-2 text-gray-600 hover:text-blue-800" onClick={() => setIsMobileMenuOpen(false)}>
                      <BarChart3 className="mr-2 h-4 w-4" /> DIP
                    </Link>
                  </>
                )
              }
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t space-y-2">
              {token ? (
                <>
                  <Link href={getDashboardLink()}>
                    <button className="w-full flex items-center justify-center px-4 py-2 font-semibold bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 text-gray-800">
                      <User className="mr-2 w-4 h-4" />
                      Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 font-semibold text-white bg-red-500 rounded-lg transition-colors hover:bg-red-600"
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register">
                    <button className="w-full px-4 py-2 font-semibold text-blue-800 border border-blue-800 rounded-lg hover:bg-blue-50">
                      Daftar
                    </button>
                  </Link>
                  <Link href="/login">
                    <button className="w-full flex items-center justify-center px-4 py-2 font-semibold text-white rounded-lg transition-colors bg-blue-800 hover:bg-blue-600">
                      <LogIn className="mr-2 w-4 h-4" />
                      Login
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
