"use client";

import React, { useEffect } from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";

const Footer = () => {
  const { settings, refetch } = useSettings();
  const footer = settings?.footer as Record<string, unknown> | undefined;
  
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
  
  const description = footer?.description 
    ? String(footer.description) 
    : 'Melayani permintaan informasi publik sesuai UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik.';

  return (
    <footer className="bg-blue-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Informasi Kontak */}
          {(footer?.showContact !== false) && (
            <div>
              <h3 className="text-lg font-bold mb-4">Kontak {footer?.companyName || 'PPID'}</h3>
              <div className="space-y-3 text-sm">
                {(footer?.showAddress !== false) && footer?.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                    <span>{footer.address}</span>
                  </div>
                )}
                {footer?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{footer.phone}</span>
                  </div>
                )}
                {footer?.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{footer.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jam Layanan */}
          <div>
            <h3 className="text-lg font-bold mb-4">Jam Layanan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Senin - Jumat</span>
              </div>
              <p className="ml-6">08:00 - 16:00 WIB</p>
              <p className="text-blue-200 text-xs mt-2">
                *Kecuali hari libur nasional
              </p>
            </div>
          </div>

          {/* Link Penting */}
          <div>
            <h3 className="text-lg font-bold mb-4">Link Penting</h3>
            <div className="space-y-2 text-sm">
              {Array.isArray(footer?.quickLinks) && footer.quickLinks.length > 0 ? (
                footer.quickLinks
                  .filter((link: unknown) => {
                    const linkObj = link as { label?: unknown; url?: unknown };
                    return linkObj.label && String(linkObj.label).trim() && linkObj.url && String(linkObj.url).trim();
                  })
                  .map((link: unknown, index: number) => {
                    const linkObj = link as { label?: unknown; url?: unknown };
                    const linkLabel: string = String(linkObj.label);
                    const linkUrl: string = String(linkObj.url);
                    return (
                      <Link 
                        key={index} 
                        href={linkUrl} 
                        className="flex items-center hover:text-blue-200 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        <span>{linkLabel}</span>
                      </Link>
                    );
                  })
              ) : (
                <>
                  <Link href="/permohonan" className="flex items-center hover:text-blue-200 transition-colors">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Permohonan Informasi
                  </Link>
                  <Link href="/dip" className="flex items-center hover:text-blue-200 transition-colors">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Daftar Informasi Publik
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Tentang & Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">{(footer?.companyName as string) || 'PPID Diskominfo'}</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              {description}
            </p>
            
            {(footer?.showSocialMedia !== false) && footer?.socialMedia && (
              <div className="mt-4">
                <div className="flex space-x-3">
                  {(() => {
                    const socialMedia = footer.socialMedia as Record<string, unknown>;
                    const socialLinks: React.ReactNode[] = [];
                    
                    if (socialMedia?.facebook && String(socialMedia.facebook).trim()) {
                      socialLinks.push(
                        <a key="facebook" href={String(socialMedia.facebook)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                          <Facebook className="h-5 w-5" />
                        </a>
                      );
                    }
                    
                    if (socialMedia?.instagram && String(socialMedia.instagram).trim()) {
                      socialLinks.push(
                        <a key="instagram" href={String(socialMedia.instagram)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                          <Instagram className="h-5 w-5" />
                        </a>
                      );
                    }
                    
                    if (socialMedia?.twitter && String(socialMedia.twitter).trim()) {
                      socialLinks.push(
                        <a key="twitter" href={String(socialMedia.twitter)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                          <Twitter className="h-5 w-5" />
                        </a>
                      );
                    }
                    
                    if (socialMedia?.youtube && String(socialMedia.youtube).trim()) {
                      socialLinks.push(
                        <a key="youtube" href={String(socialMedia.youtube)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                          <Youtube className="h-5 w-5" />
                        </a>
                      );
                    }
                    
                    return socialLinks.length > 0 ? socialLinks : null;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue-700 mt-8 pt-6 text-center text-sm text-blue-200">
          <p>{footer?.copyrightText || '© 2024 PPID Dinas Komunikasi dan Informatika Kabupaten Garut. Hak Cipta Dilindungi.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;