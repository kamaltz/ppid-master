"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FooterSettings {
  companyName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  quickLinks: { label: string; url: string; }[];
  copyrightText: string;
  showAddress: boolean;
  showContact: boolean;
  showSocialMedia: boolean;
}

export default function CustomFooter() {
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyName: 'PPID Kabupaten Garut',
    description: '',
    address: '',
    phone: '',
    email: '',
    socialMedia: { facebook: '', twitter: '', instagram: '', youtube: '' },
    quickLinks: [],
    copyrightText: 'PPID Kabupaten Garut. Semua hak dilindungi.',
    showAddress: true,
    showContact: true,
    showSocialMedia: true
  });

  useEffect(() => {
    loadFooterSettings();
    
    // Listen for settings changes
    const handleSettingsChange = () => {
      console.log('Settings changed event received, reloading footer...');
      loadFooterSettings();
    };
    
    window.addEventListener('settingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, []);

  const loadFooterSettings = async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`);
      const result = await response.json();
      
      if (result.success && result.data.footer) {
        setFooterSettings(result.data.footer);
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    }
  };

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{footerSettings.companyName}</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              {footerSettings.description}
            </p>
            {footerSettings.showAddress && footerSettings.address && (
              <div className="text-gray-300 text-sm">
                <p className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {footerSettings.address}
                </p>
              </div>
            )}
          </div>

          {/* Contact Info */}
          {footerSettings.showContact && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontak</h4>
              <div className="space-y-3 text-gray-300">
                {footerSettings.phone && (
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {footerSettings.phone}
                  </p>
                )}
                {footerSettings.email && (
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {footerSettings.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Menu Cepat</h4>
            <ul className="space-y-2">
              {footerSettings.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.url}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          {footerSettings.showSocialMedia && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Ikuti Kami</h4>
              <div className="flex space-x-4">
                {footerSettings.socialMedia.facebook && (
                  <a 
                    href={footerSettings.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {footerSettings.socialMedia.instagram && (
                  <a 
                    href={footerSettings.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-pink-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                    </svg>
                  </a>
                )}
                {footerSettings.socialMedia.twitter && (
                  <a 
                    href={footerSettings.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {footerSettings.socialMedia.youtube && (
                  <a 
                    href={footerSettings.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} {footerSettings.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}