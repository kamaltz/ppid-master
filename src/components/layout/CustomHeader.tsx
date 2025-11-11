"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';

interface MenuItem {
  label: string;
  url: string;
  hasDropdown: boolean;
  dropdownItems: { label: string; url: string; }[];
}

export default function CustomHeader() {
  const { settings, refetch } = useSettings();
  
  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      refetch();
    };
    
    window.addEventListener('settingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, [refetch]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              {settings?.general?.logo && (
                <Image 
                  src={settings.general.logo.replace(/^https?:\/\/localhost:\d+/, '')} 
                  alt="Logo" 
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
              )}
              <span className="text-xl font-bold text-gray-800">
                {settings?.general?.namaInstansi || 'PPID Garut'}
              </span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {(settings?.header?.menuItems || []).map((item: MenuItem, index: number) => (
              <div
                key={index}
                className="relative group"
              >
                <Link
                  href={item.url}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 py-2"
                >
                  {item.label}
                  {item.hasDropdown && item.dropdownItems.length > 0 && (
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.hasDropdown && item.dropdownItems.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] transform translate-y-2 group-hover:translate-y-0">
                    {item.dropdownItems.map((dropItem, dropIndex) => (
                      <Link
                        key={dropIndex}
                        href={dropItem.url}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {dropItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}