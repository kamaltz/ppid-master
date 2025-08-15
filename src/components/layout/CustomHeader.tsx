"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MenuItem {
  label: string;
  url: string;
  hasDropdown: boolean;
  dropdownItems: { label: string; url: string; }[];
}

interface HeaderSettings {
  logo: string;
  menuItems: MenuItem[];
}

export default function CustomHeader() {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
    logo: '',
    menuItems: []
  });
  const [generalSettings, setGeneralSettings] = useState({
    namaInstansi: 'PPID Garut',
    logo: ''
  });


  useEffect(() => {
    loadHeaderSettings();
    
    // Listen for settings changes
    const handleSettingsChange = () => {
      console.log('Settings changed event received, reloading header...');
      loadHeaderSettings();
    };
    
    window.addEventListener('settingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, []);

  const loadHeaderSettings = async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`);
      const result = await response.json();
      
      console.log('Header loading settings:', result);
      
      if (result.success) {
        if (result.data.header) {
          console.log('Setting header from API:', result.data.header);
          setHeaderSettings(result.data.header);
        }
        if (result.data.general) {
          console.log('Setting general from API:', result.data.general);
          setGeneralSettings(result.data.general);
        }
      } else {
        console.log('Using default header settings');
        // Set default menu items if no settings found
        setHeaderSettings({
          logo: '',
          menuItems: [
            { label: 'Beranda', url: '/', hasDropdown: false, dropdownItems: [] },
            { label: 'Profil', url: '/profil', hasDropdown: true, dropdownItems: [
              { label: 'Tentang PPID', url: '/profil' },
              { label: 'Visi Misi', url: '/visi-misi' },
              { label: 'Struktur Organisasi', url: '/struktur' }
            ]},
            { label: 'Informasi Publik', url: '/informasi', hasDropdown: false, dropdownItems: [] },
            { label: 'Layanan', url: '/layanan', hasDropdown: true, dropdownItems: [
              { label: 'Permohonan Informasi', url: '/permohonan' },
              { label: 'Keberatan', url: '/keberatan' }
            ]}
          ]
        });
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
      // Set default menu items on error
      setHeaderSettings({
        logo: '',
        menuItems: [
          { label: 'Beranda', url: '/', hasDropdown: false, dropdownItems: [] },
          { label: 'Profil', url: '/profil', hasDropdown: true, dropdownItems: [
            { label: 'Tentang PPID', url: '/profil' },
            { label: 'Visi Misi', url: '/visi-misi' }
          ]}
        ]
      });
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              {(generalSettings.logo || headerSettings.logo) && (
                <Image 
                  src={generalSettings.logo || headerSettings.logo} 
                  alt="Logo" 
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
              )}
              <span className="text-xl font-bold text-gray-800">
                {generalSettings.namaInstansi || 'PPID Garut'}
              </span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {headerSettings.menuItems.map((item, index) => (
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