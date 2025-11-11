"use client";

import { useState, useEffect } from "react";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { MenuItem, DropdownItem } from "@/types/menu";
import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  ctaEnabled: boolean;
  ctaPosition?: string;
  ctaCustomCss?: string;
  backgroundPosition: string;
  cleanImage?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  subtitleColor?: string;
  subtitleFontSize?: string;
  descriptionColor?: string;
  descriptionFontSize?: string;
  ctaBackground?: string;
  ctaTextColor?: string;
  ctaBorderRadius?: string;
  ctaPadding?: string;
  ctaFontSize?: string;
  ctaFontWeight?: string;
}

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  backgroundType?: 'gradient' | 'image' | 'solid';
  backgroundGradient?: string;
  backgroundColor?: string;
  backgroundPosition?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  ctaText: string;
  ctaUrl: string;
  ctaPosition?: string;
  ctaCustomCss?: string;
  isCarousel: boolean;
  autoSlide: boolean;
  slideInterval: number;
  showCarouselCTA: boolean;
  cleanTemplate: boolean;
  slides: Slide[];
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  subtitleColor?: string;
  subtitleFontSize?: string;
  descriptionColor?: string;
  descriptionFontSize?: string;
  ctaBackground?: string;
  ctaTextColor?: string;
  ctaBorderRadius?: string;
  ctaPadding?: string;
  ctaFontSize?: string;
  ctaFontWeight?: string;
}

export default function AdminPengaturanPage() {
  const {} = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    namaInstansi: "PPID Diskominfo Kabupaten Garut",
    logo: "",
    favicon: "",
    email: "ppid@garutkab.go.id",
    telepon: "(0262) 123456",
    alamat: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
    websiteTitle: "PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik",
    websiteDescription:
      "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.",
    marqueeEnabled: false,
    marqueeText: "Selamat datang di PPID Kabupaten Garut - Layanan Informasi Publik yang Transparan",
    marqueeSpeed: "slow",
    marqueeTextColor: "#ffffff",
    marqueeBackgroundColor: "#2563eb",
    marqueeFontSize: "14",
    marqueeFontWeight: "normal",
  });
  const [applicationsSettings, setApplicationsSettings] = useState({
    enabled: true,
    apps: [] as Array<{
      id: string;
      name: string;
      logo: string;
      url: string;
      description?: string;
    }>
  });
  const [headerSettings, setHeaderSettings] = useState({
    menuItems: [
      { label: "Beranda", url: "/", hasDropdown: false, dropdownItems: [] },
      {
        label: "Profil",
        url: "/profil",
        hasDropdown: true,
        dropdownItems: [
          { label: "Tentang PPID", url: "/profil" },
          { label: "Visi Misi", url: "/visi-misi" },
          { label: "Struktur Organisasi", url: "/struktur" },
        ],
      },
      {
        label: "Informasi Publik",
        url: "/informasi",
        hasDropdown: false,
        dropdownItems: [],
      },
      {
        label: "Layanan",
        url: "/layanan",
        hasDropdown: true,
        dropdownItems: [
          { label: "Permohonan Informasi", url: "/permohonan" },
          { label: "Keberatan", url: "/keberatan" },
        ],
      },
    ],
  });
  const [footerSettings, setFooterSettings] = useState({
    companyName: "PPID Kabupaten Garut",
    description:
      "PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.",
    address: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
    phone: "(0262) 123456",
    email: "ppid@garutkab.go.id",
    serviceHours: {
      weekdays: "Senin - Jumat: 08:00 - 16:00 WIB",
      weekend: "Sabtu - Minggu: Tutup",
      holidays: "Hari Libur Nasional: Tutup",
      weekdayStart: "08:00",
      weekdayEnd: "16:00",
      weekdayClosed: false,
      weekendStart: "",
      weekendEnd: "",
      weekendClosed: true,
      holidayStatus: "closed",
    },
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
    quickLinks: [
      { label: "Beranda", url: "/" },
      { label: "Profil PPID", url: "/profil" },
      { label: "DIP", url: "/dip" },
      { label: "Kontak", url: "/kontak" },
    ],
    importantLinks: [
      { label: "Permohonan Informasi", url: "/permohonan" },
      { label: "Keberatan Informasi", url: "/keberatan" },
      { label: "Daftar Informasi Publik", url: "/dip" },
      { label: "Standar Layanan", url: "/standar-layanan" },
    ],
    copyrightText: "PPID Kabupaten Garut. Semua hak dilindungi.",
    showAddress: true,
    showContact: true,
    showSocialMedia: true,
    showServiceHours: true,
    showImportantLinks: true,
    showQuickLinks: true,
  });

  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: "Selamat Datang di PPID Kabupaten Garut",
    subtitle: "Pejabat Pengelola Informasi dan Dokumentasi",
    description:
      "Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.",
    backgroundImage: "",
    backgroundType: "gradient",
    backgroundGradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)",
    backgroundColor: "#0f172a",
    backgroundPosition: "cover",
    overlayColor: "#0f172a",
    overlayOpacity: 0.7,
    ctaText: "Ajukan Permohonan",
    ctaUrl: "/permohonan",
    ctaPosition: "center",
    ctaCustomCss: "",
    isCarousel: false,
    autoSlide: true,
    slideInterval: 4000,
    showCarouselCTA: false,
    cleanTemplate: false,
    slides: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statsConfig, setStatsConfig] = useState({
    mode: 'auto' as 'manual' | 'auto',
    manual: {
      permintaanSelesai: 150,
      rataRataHari: 7,
      totalInformasi: 85,
      aksesOnline: '24/7'
    }
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [autoStats, setAutoStats] = useState({
    permintaanSelesai: 0,
    rataRataHari: 0,
    totalInformasi: 0,
    aksesOnline: '24/7'
  });
  const [statsError, setStatsError] = useState<string | null>(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  const HeroPreview = ({ slide, isStatic = false }: { slide: Slide | HeroSettings, isStatic?: boolean }) => {
    const bgImage = 'image' in slide ? slide.image : 'backgroundImage' in slide ? slide.backgroundImage : '';
    const bgPos = 'backgroundPosition' in slide ? slide.backgroundPosition || 'cover' : 'cover';
    const cleanImage = isStatic ? heroSettings.cleanTemplate : ('cleanImage' in slide ? slide.cleanImage : false);
    const overlayColor = 'overlayColor' in slide ? slide.overlayColor || '#0f172a' : '#0f172a';
    const overlayOpacity = 'overlayOpacity' in slide ? slide.overlayOpacity ?? 0.7 : 0.7;
    const ctaPos = isStatic ? heroSettings.ctaPosition || 'center' : ('ctaPosition' in slide ? slide.ctaPosition || 'center' : 'center');
    const ctaCss = isStatic ? heroSettings.ctaCustomCss || '' : ('ctaCustomCss' in slide ? slide.ctaCustomCss || '' : '');
    
    const titleColor = slide.titleColor || '#ffffff';
    const titleSize = slide.titleFontSize || '24px';
    const titleWeight = slide.titleFontWeight || 'bold';
    const subtitleColor = slide.subtitleColor || '#ffffff';
    const subtitleSize = slide.subtitleFontSize || '14px';
    const descColor = slide.descriptionColor || '#bfdbfe';
    const descSize = slide.descriptionFontSize || '14px';
    const ctaBg = slide.ctaBackground || '#ffffff';
    const ctaColor = slide.ctaTextColor || '#1e40af';
    const ctaRadius = slide.ctaBorderRadius || '8px';
    const ctaPad = slide.ctaPadding || '8px 16px';
    const ctaSize = slide.ctaFontSize || '14px';
    const ctaWeight = slide.ctaFontWeight || '600';
    
    const getBackgroundStyle = () => {
      if (isStatic) {
        const bgType = heroSettings.backgroundType || 'gradient';
        if (bgType === 'solid') {
          return heroSettings.backgroundColor || '#0f172a';
        }
        if (bgType === 'gradient') {
          return heroSettings.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)';
        }
        if (bgType === 'image' && bgImage) {
          if (cleanImage) return `url(${bgImage})`;
          const hexOpacity = Math.round(overlayOpacity * 255).toString(16).padStart(2, '0');
          return `linear-gradient(${overlayColor}${hexOpacity}, ${overlayColor}${hexOpacity}), url(${bgImage})`;
        }
        return heroSettings.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)';
      }
      
      if (!bgImage) {
        return 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)';
      }
      if (cleanImage) {
        return `url(${bgImage})`;
      }
      const hexOpacity = Math.round(overlayOpacity * 255).toString(16).padStart(2, '0');
      return `linear-gradient(${overlayColor}${hexOpacity}, ${overlayColor}${hexOpacity}), url(${bgImage})`;
    };
    
    return (
      <div 
        className="relative w-full h-64 rounded-lg overflow-hidden"
        style={{
          backgroundImage: getBackgroundStyle(),
          backgroundSize: bgPos === 'fill' ? '100% 100%' : bgPos === 'contain' ? 'contain' : 'cover',
          backgroundPosition: ['top','bottom','left','right','center'].includes(bgPos) ? bgPos : 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          {!cleanImage && (
            <>
              <span 
                className="bg-white/20 px-3 py-1 rounded-full mb-2"
                style={{ color: subtitleColor, fontSize: subtitleSize }}
              >
                {slide.subtitle}
              </span>
              <h3 
                className="mb-2"
                style={{ color: titleColor, fontSize: titleSize, fontWeight: titleWeight }}
              >
                {slide.title}
              </h3>
              <p 
                className="mb-3"
                style={{ color: descColor, fontSize: descSize }}
              >
                {slide.description}
              </p>
            </>
          )}
          {'ctaEnabled' in slide && slide.ctaEnabled && slide.ctaText && (
            <div className={`flex w-full ${
              slide.ctaPosition === 'left' ? 'justify-start' :
              slide.ctaPosition === 'right' ? 'justify-end' : 'justify-center'
            }`}>
              <button 
                className="flex items-center"
                style={{
                  background: ctaBg,
                  color: ctaColor,
                  padding: ctaPad,
                  borderRadius: ctaRadius,
                  fontSize: ctaSize,
                  fontWeight: ctaWeight,
                  ...(slide.ctaCustomCss ? Object.fromEntries(
                    slide.ctaCustomCss.split(';').filter(s => s.trim()).map(s => {
                      const [key, value] = s.split(':').map(p => p.trim());
                      return [key.replace(/-([a-z])/g, (_, l) => l.toUpperCase()), value];
                    })
                  ) : {})
                }}
              >
                → {slide.ctaText}
              </button>
            </div>
          )}
          {isStatic && !heroSettings.cleanTemplate && heroSettings.ctaText && (
            <div className={`flex w-full ${
              ctaPos === 'left' ? 'justify-start' :
              ctaPos === 'right' ? 'justify-end' : 'justify-center'
            }`}>
              <button 
                className="flex items-center"
                style={{
                  background: ctaBg,
                  color: ctaColor,
                  padding: ctaPad,
                  borderRadius: ctaRadius,
                  fontSize: ctaSize,
                  fontWeight: ctaWeight,
                  ...(ctaCss ? Object.fromEntries(
                    ctaCss.split(';').filter(s => s.trim()).map(s => {
                      const [key, value] = s.split(':').map(p => p.trim());
                      return [key.replace(/-([a-z])/g, (_, l) => l.toUpperCase()), value];
                    })
                  ) : {})
                }}
              >
                → {heroSettings.ctaText}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    loadStatsConfig();
  }, []);

  const loadStatsConfig = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await fetch('/api/settings/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Loaded stats config:', data);
      
      if (data.success && data.config) {
        console.log('⚙️ Settings: Loaded config:', data.config);
        setStatsConfig(data.config);
        setStatsError(null);
      } else {
        setStatsError(data.error || 'Gagal memuat konfigurasi statistik');
      }
      
      if (data.autoStats) {
        console.log('⚙️ Settings: Loaded auto stats:', data.autoStats);
        setAutoStats(data.autoStats);
      }
    } catch (error) {
      console.error('Error loading stats config:', error);
      setStatsError(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data statistik');
    } finally {
      setStatsLoading(false);
    }
  };

  const saveStatsConfig = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      console.log('Saving stats config:', statsConfig);
      
      const response = await fetch('/api/settings/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statsConfig)
      });
      
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setToast({ message: 'Pengaturan statistik berhasil disimpan!', type: 'success' });
        // Refresh the config to show updated values
        await loadStatsConfig();
        
        // Force homepage stats refresh
        if (typeof window !== 'undefined') {
          // Clear any cached data
          if ('caches' in window) {
            caches.delete('stats-cache');
          }
          
          // Trigger immediate refresh
          window.dispatchEvent(new CustomEvent('statsConfigChanged'));
          
          // Cross-tab updates
          localStorage.setItem('statsUpdated', Date.now().toString());
          setTimeout(() => localStorage.removeItem('statsUpdated'), 100);
        }
      } else {
        setStatsError(data.error || 'Gagal menyimpan pengaturan');
        setToast({ message: data.error || 'Gagal menyimpan pengaturan statistik', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving stats config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan';
      setStatsError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      // Validate and clean header settings
      const cleanedHeaderSettings = {
        ...headerSettings,
        menuItems: (headerSettings.menuItems || [])
          .filter(item => item.label && item.label.trim() !== '') // Only save items with labels
          .map(item => ({
            label: item.label.trim(),
            url: item.url || '/',
            hasDropdown: Boolean(item.hasDropdown),
            dropdownItems: (item.dropdownItems || [])
              .filter(dropItem => dropItem.label && dropItem.label.trim() !== '') // Only save dropdown items with labels
              .map(dropItem => ({
                label: dropItem.label.trim(),
                url: dropItem.url || '/'
              }))
          }))
      };

      // Save all settings
      const settingsToSave = [
        { key: "general", value: settings },
        { key: "header", value: cleanedHeaderSettings },
        { key: "footer", value: footerSettings },
        { key: "hero", value: heroSettings },
        { key: "applications", value: applicationsSettings },
      ];
      
      console.log('Saving header settings:', cleanedHeaderSettings);
      console.log('Saving settings with', cleanedHeaderSettings.menuItems?.length || 0, 'menu items');

      let allSuccess = true;

      for (const setting of settingsToSave) {
        let retries = 3;
        let saved = false;
        
        while (retries > 0 && !saved) {
          try {
            const response = await fetch("/api/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(setting),
            });

            if (response.status === 503) {
              console.warn(`Database unavailable for ${setting.key}, retrying... (${retries} left)`);
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              } else {
                console.error(`Failed to save ${setting.key} after retries`);
                allSuccess = false;
                break;
              }
            }

            if (!response.ok) {
              console.error(`Failed to save ${setting.key}:`, response.status);
              allSuccess = false;
              break;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              console.error(`Non-JSON response for ${setting.key}`);
              allSuccess = false;
              break;
            }

            const result = await response.json();
            console.log(`Saved ${setting.key}:`, result);

            if (!result.success) {
              console.error(`API error for ${setting.key}:`, result.error);
              allSuccess = false;
              break;
            }
            
            saved = true;
          } catch (error) {
            console.error(`Error saving ${setting.key}:`, error);
            retries--;
            if (retries === 0) {
              allSuccess = false;
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      }

      // Save statistics settings if on stats tab or saving all
      try {
        const statsResponse = await fetch('/api/settings/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statsConfig)
        });
        
        if (!statsResponse.ok) {
          console.warn('Failed to save statistics settings');
        }
      } catch (error) {
        console.error('Error saving statistics:', error);
      }

      if (allSuccess) {
        setShowSuccessModal(true);

        // Force reload all components by clearing cache
        if (typeof window !== "undefined") {
          // Clear all caches
          sessionStorage.removeItem('cachedSettings');
          if ('caches' in window) {
            caches.delete('stats-cache');
          }
          
          // Immediate event dispatch
          window.dispatchEvent(new CustomEvent("settingsChanged"));
          window.dispatchEvent(new CustomEvent('statsConfigChanged'));
          
          // Cross-tab updates
          localStorage.setItem('statsUpdated', Date.now().toString());
          localStorage.setItem("settingsUpdated", Date.now().toString());
          
          setTimeout(() => {
            localStorage.removeItem('statsUpdated');
            localStorage.removeItem("settingsUpdated");
          }, 100);
        }
        
        // Reload settings immediately
        await loadSettings();
        
        // Force favicon update with aggressive cache busting
        if (settings.favicon) {
          console.log('Forcing favicon update to:', settings.favicon);
          
          // Only reload if not already in a favicon update cycle
          if (!window.location.href.includes('favicon_update=')) {
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }
      } else {
        setToast({
          message: "Gagal menyimpan pengaturan. Database tidak tersedia (Error 503). Silakan coba lagi nanti atau hubungi administrator.",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setToast({
        message: "Gagal menyimpan pengaturan: " + (error instanceof Error ? error.message : "Unknown error"),
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`);

      if (response.status === 503) {
        console.warn("Database unavailable, using current settings");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(
          "Non-JSON response from settings API, using current settings"
        );
        return;
      }

      const result = await response.json();
      console.log("Loaded settings:", result);

      if (result.success) {
        if (result.data.general) {
          setSettings(result.data.general);
        }
        if (result.data.header) {
          console.log('Loading header settings:', result.data.header);
          setHeaderSettings(result.data.header);
        }
        if (result.data.footer) {
          setFooterSettings(result.data.footer);
        }
        if (result.data.hero) {
          const heroData = result.data.hero;
          const slidesWithDefaults = (heroData.slides || []).map(
            (slide: unknown) => {
              const slideData = slide as Record<string, unknown>;
              return {
                ...slideData,
                ctaText: slideData.ctaText ?? "",
                ctaUrl: slideData.ctaUrl ?? "",
                ctaEnabled: slideData.ctaEnabled ?? false,
                ctaPosition: slideData.ctaPosition ?? "center",
                ctaCustomCss: slideData.ctaCustomCss ?? "",
                backgroundPosition: slideData.backgroundPosition ?? "cover",
                cleanImage: slideData.cleanImage ?? true,
                overlayColor: slideData.overlayColor ?? "#0f172a",
                overlayOpacity: slideData.overlayOpacity ?? 0.7,
              };
            }
          );

          setHeroSettings({
            ...heroData,
            slides: slidesWithDefaults || [],
          });
        }
        if (result.data.applications) {
          setApplicationsSettings(result.data.applications);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleFooterChange = (field: string, value: unknown) => {
    setFooterSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeroChange = (field: string, value: string) => {
    setHeroSettings((prev) => ({ ...prev, [field]: value || "" }));
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    console.log("Uploading file:", file.name, file.size, file.type);

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Upload result:", result);

      if (result.success) {
        setHeroSettings((prev) => ({ ...prev, backgroundImage: result.url }));
        setToast({ message: 'Gambar berhasil diupload!', type: 'success' });
      } else {
        setToast({ message: 'Gagal upload gambar: ' + result.error, type: 'error' });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setToast({ message: 'Gagal upload gambar', type: 'error' });
    }
  };

  const handleFaviconUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setSettings((prev) => ({ ...prev, favicon: result.url }));
        setToast({ message: 'Favicon berhasil diupload!', type: 'success' });
      } else {
        setToast({ message: 'Gagal upload favicon: ' + result.error, type: 'error' });
      }
    } catch (error) {
      console.error("Favicon upload error:", error);
      setToast({ message: 'Gagal upload favicon', type: 'error' });
    }
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      image: "",
      title: "",
      subtitle: "",
      description: "",
      ctaText: "",
      ctaUrl: "",
      ctaEnabled: false,
      ctaPosition: "center",
      ctaCustomCss: "",
      backgroundPosition: "cover",
      cleanImage: true,
      overlayColor: "#0f172a",
      overlayOpacity: 0.7,
      titleColor: "#ffffff",
      titleFontSize: "32px",
      titleFontWeight: "bold",
      subtitleColor: "#ffffff",
      subtitleFontSize: "14px",
      descriptionColor: "#bfdbfe",
      descriptionFontSize: "14px",
      ctaBackground: "#ffffff",
      ctaTextColor: "#1e40af",
      ctaBorderRadius: "8px",
      ctaPadding: "10px 20px",
      ctaFontSize: "14px",
      ctaFontWeight: "600",
    };
    setHeroSettings((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
  };

  const updateSlide = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    setHeroSettings((prev) => ({
      ...prev,
      slides: prev.slides.map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide
      ),
    }));
  };

  const removeSlide = (index: number) => {
    setHeroSettings((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  const cropAndResizeImage = (
    file: File,
    targetWidth = 1920,
    targetHeight = 1080
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new window.Image();

      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculate crop dimensions to maintain aspect ratio
        const imgRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;

        let drawWidth = img.width;
        let drawHeight = img.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > targetRatio) {
          drawWidth = img.height * targetRatio;
          offsetX = (img.width - drawWidth) / 2;
        } else {
          drawHeight = img.width / targetRatio;
          offsetY = (img.height - drawHeight) / 2;
        }

        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        canvas.toBlob(
          (blob) => {
            const croppedFile = new File([blob!], file.name, {
              type: file.type,
            });
            resolve(croppedFile);
          },
          file.type,
          0.9
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadSlideImage = async (file: File, slideIndex: number) => {
    try {
      const croppedFile = await cropAndResizeImage(file);
      const formData = new FormData();
      formData.append("file", croppedFile);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        updateSlide(slideIndex, "image", result.url);
        setToast({ message: 'Gambar slide berhasil diupload dan disesuaikan!', type: 'success' });
      } else {
        setToast({ message: 'Gagal upload gambar: ' + result.error, type: 'error' });
      }
    } catch {
      setToast({ message: 'Gagal upload gambar', type: 'error' });
    }
  };

  const addMenuItem = () => {
    const newItem = {
      label: "Menu Baru",
      url: "/",
      hasDropdown: false,
      dropdownItems: [],
    };
    setHeaderSettings((prev) => ({
      ...prev,
      menuItems: [...(prev.menuItems || []), newItem],
    }));
  };

  const updateMenuItem = (index: number, field: string, value: unknown) => {
    setHeaderSettings((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          // Ensure dropdownItems is always an array
          if (!updatedItem.dropdownItems) {
            updatedItem.dropdownItems = [];
          }
          // If hasDropdown is false, clear dropdown items
          if (field === 'hasDropdown' && !value) {
            updatedItem.dropdownItems = [];
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const addDropdownItem = (menuIndex: number) => {
    const newDropdownItem = { label: "Sub Menu", url: "/" };
    setHeaderSettings((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) =>
        i === menuIndex
          ? {
              ...item,
              dropdownItems: [...(item.dropdownItems || []), newDropdownItem],
            }
          : item
      ),
    }));
  };

  const removeMenuItem = (index: number) => {
    setHeaderSettings((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index),
    }));
  };

  const removeDropdownItem = (menuIndex: number, dropdownIndex: number) => {
    setHeaderSettings((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) =>
        i === menuIndex
          ? {
              ...item,
              dropdownItems: item.dropdownItems.filter(
                (_, j) => j !== dropdownIndex
              ),
            }
          : item
      ),
    }));
  };

  const [isResetting, setIsResetting] = useState(false);
  const [isResettingTab, setIsResettingTab] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning'} | null>(null);

  const resetTabToDefault = async (tabName: string) => {
    setConfirmTitle(`Reset Pengaturan ${tabName}`);
    setConfirmMessage(`Yakin ingin reset pengaturan ${tabName} ke default? Kustomisasi pada tab ini akan hilang.`);
    setConfirmAction(() => async () => {
      await performResetTab(tabName);
    });
    setShowConfirmModal(true);
  };

  const performResetTab = async (tabName: string) => {

    setIsResettingTab(true);

    const defaultSettings: Record<string, unknown> = {
      general: {
        namaInstansi: "PPID Diskominfo Kabupaten Garut",
        logo: "/logo-garut.svg",
        email: "ppid@garutkab.go.id",
        telepon: "(0262) 123456",
        alamat: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
        websiteTitle: "PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik",
        websiteDescription: "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.",
        marqueeEnabled: false,
        marqueeText: "Selamat datang di PPID Kabupaten Garut - Layanan Informasi Publik yang Transparan",
        marqueeSpeed: "slow",
      },
      applications: {
        enabled: true,
        apps: []
      },
      header: {
        menuItems: [
          { label: "Beranda", url: "/", hasDropdown: false, dropdownItems: [] },
          {
            label: "Profil",
            url: "/profil",
            hasDropdown: true,
            dropdownItems: [
              { label: "Tentang PPID", url: "/profil" },
              { label: "Visi Misi", url: "/visi-misi" },
              { label: "Struktur Organisasi", url: "/struktur" },
            ],
          },
          { label: "Informasi Publik", url: "/informasi", hasDropdown: false, dropdownItems: [] },
          {
            label: "Layanan",
            url: "/layanan",
            hasDropdown: true,
            dropdownItems: [
              { label: "Permohonan Informasi", url: "/permohonan" },
              { label: "Keberatan", url: "/keberatan" },
            ],
          },
        ],
      },
      footer: {
        companyName: "PPID Kabupaten Garut",
        description: "PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.",
        address: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
        phone: "(0262) 123456",
        email: "ppid@garutkab.go.id",
        socialMedia: { facebook: "", twitter: "", instagram: "", youtube: "" },
        quickLinks: [
          { label: "Beranda", url: "/" },
          { label: "Profil PPID", url: "/profil" },
          { label: "DIP", url: "/dip" },
          { label: "Kontak", url: "/kontak" },
        ],
        copyrightText: "PPID Kabupaten Garut. Semua hak dilindungi.",
        showAddress: true,
        showContact: true,
        showSocialMedia: true,
      },
      hero: {
        title: "Selamat Datang di PPID Kabupaten Garut",
        subtitle: "Pejabat Pengelola Informasi dan Dokumentasi",
        description: "Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.",
        backgroundImage: "",
        ctaText: "Ajukan Permohonan",
        ctaUrl: "/permohonan",
        isCarousel: false,
        autoSlide: true,
        slideInterval: 4000,
        slides: [],
      },
    };

    try {
      if (tabName === 'stats') {
        // Reset statistics settings
        const defaultStatsConfig = {
          mode: 'auto' as 'manual' | 'auto',
          manual: {
            permintaanSelesai: 150,
            rataRataHari: 7,
            totalInformasi: 85,
            aksesOnline: '24/7'
          }
        };
        
        const response = await fetch('/api/settings/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultStatsConfig)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to reset statistics`);
        }
        
        setStatsConfig(defaultStatsConfig);
        setToast({ message: 'Pengaturan statistik berhasil direset ke default!', type: 'success' });
      } else {
        // Reset other settings
        const response = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: tabName, value: defaultSettings[tabName] }),
        });

        if (!response.ok) {
          throw new Error(`Failed to reset ${tabName}`);
        }

        setToast({ message: `Pengaturan ${tabName} berhasil direset ke default!`, type: 'success' });
        await loadSettings();
      }
    } catch (error) {
      console.error(`Reset ${tabName} error:`, error);
      setToast({ message: `Gagal reset pengaturan ${tabName}`, type: 'error' });
    } finally {
      setIsResettingTab(false);
    }
  };

  const resetToDefault = async () => {
    setConfirmTitle("Reset Semua Pengaturan");
    setConfirmMessage("Yakin ingin reset semua pengaturan ke default? Semua kustomisasi akan hilang.");
    setConfirmAction(() => async () => {
      await performResetAll();
    });
    setShowConfirmModal(true);
  };

  const performResetAll = async () => {

    setIsResetting(true);

    const defaultSettings = {
      general: {
        namaInstansi: "PPID Diskominfo Kabupaten Garut",
        logo: "/logo-garut.svg",
        email: "ppid@garutkab.go.id",
        telepon: "(0262) 123456",
        alamat: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
        websiteTitle:
          "PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik",
        websiteDescription:
          "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.",
        marqueeEnabled: false,
        marqueeText: "Selamat datang di PPID Kabupaten Garut - Layanan Informasi Publik yang Transparan",
        marqueeSpeed: "slow",
      },
      applications: {
        enabled: true,
        apps: []
      },
      header: {
        menuItems: [
          { label: "Beranda", url: "/", hasDropdown: false, dropdownItems: [] },
          {
            label: "Profil",
            url: "/profil",
            hasDropdown: true,
            dropdownItems: [
              { label: "Tentang PPID", url: "/profil" },
              { label: "Visi Misi", url: "/visi-misi" },
              { label: "Struktur Organisasi", url: "/struktur" },
            ],
          },
          {
            label: "Informasi Publik",
            url: "/informasi",
            hasDropdown: false,
            dropdownItems: [],
          },
          {
            label: "Layanan",
            url: "/layanan",
            hasDropdown: true,
            dropdownItems: [
              { label: "Permohonan Informasi", url: "/permohonan" },
              { label: "Keberatan", url: "/keberatan" },
            ],
          },
        ],
      },
      footer: {
        companyName: "PPID Kabupaten Garut",
        description:
          "PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.",
        address: "Jl. Pembangunan No. 1, Garut, Jawa Barat",
        phone: "(0262) 123456",
        email: "ppid@garutkab.go.id",
        socialMedia: { facebook: "", twitter: "", instagram: "", youtube: "" },
        quickLinks: [
          { label: "Beranda", url: "/" },
          { label: "Profil PPID", url: "/profil" },
          { label: "DIP", url: "/dip" },
          { label: "Kontak", url: "/kontak" },
        ],
        copyrightText: "PPID Kabupaten Garut. Semua hak dilindungi.",
        showAddress: true,
        showContact: true,
        showSocialMedia: true,
      },
      hero: {
        title: "Selamat Datang di PPID Kabupaten Garut",
        subtitle: "Pejabat Pengelola Informasi dan Dokumentasi",
        description:
          "Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.",
        backgroundImage: "",
        ctaText: "Ajukan Permohonan",
        ctaUrl: "/permohonan",
        isCarousel: false,
        autoSlide: true,
        slideInterval: 4000,
        slides: [],
      },
    };
    
    const defaultStatsConfig = {
      mode: 'auto' as 'manual' | 'auto',
      manual: {
        permintaanSelesai: 150,
        rataRataHari: 7,
        totalInformasi: 85,
        aksesOnline: '24/7'
      }
    };

    try {
      for (const [key, value] of Object.entries(defaultSettings)) {
        let retries = 3;
        let success = false;
        
        while (retries > 0 && !success) {
          try {
            const response = await fetch("/api/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key, value }),
            });

            if (response.status === 503) {
              console.warn(`Database unavailable for reset ${key}, retrying...`);
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
            }

            if (!response.ok) {
              throw new Error(`Failed to reset ${key}: ${response.status}`);
            }
            
            success = true;
          } catch (error) {
            retries--;
            if (retries === 0) {
              throw new Error(`Failed to reset ${key} after retries: ${error}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // Reset statistics settings
      try {
        const statsResponse = await fetch('/api/settings/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultStatsConfig)
        });
        
        if (statsResponse.ok) {
          setStatsConfig(defaultStatsConfig);
        }
      } catch (error) {
        console.error('Failed to reset statistics:', error);
      }
      
      setToast({ message: 'Semua pengaturan berhasil direset ke default!', type: 'success' });
      loadSettings();
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Reset error:", error);
      setToast({ message: 'Gagal reset pengaturan', type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };
  const StatsSettings = () => {
    if (statsLoading) {
      return (
        <div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (statsError) {
      return (
        <div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{statsError}</p>
            <button
              onClick={loadStatsConfig}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">📊 Pengaturan Statistik Homepage</h2>
          <div className="flex gap-2">
            <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
              <button
                onClick={() => resetTabToDefault("stats")}
                disabled={isResettingTab}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                title="Reset pengaturan statistik ke default"
              >
                {isResettingTab ? "⏳" : "🔄"} Reset Tab
              </button>
            </RoleGuard>
            <button
              onClick={saveStatsConfig}
              disabled={statsLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              {statsLoading ? '⏳ Menyimpan...' : '💾 Simpan Statistik'}
            </button>
          </div>
        </div>
        
        {statsError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              ⚠️ <strong>Error:</strong> {statsError}
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              📊 Mode Statistik
            </h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="statsMode"
                  value="manual"
                  checked={statsConfig.mode === 'manual'}
                  onChange={(e) => setStatsConfig(prev => ({ ...prev, mode: e.target.value as 'manual' | 'auto' }))}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Manual</span>
                  <p className="text-sm text-gray-600">Atur nilai statistik secara manual</p>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="statsMode"
                  value="auto"
                  checked={statsConfig.mode === 'auto'}
                  onChange={(e) => setStatsConfig(prev => ({ ...prev, mode: e.target.value as 'manual' | 'auto' }))}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Otomatis</span>
                  <p className="text-sm text-gray-600">Ambil data statistik dari database secara otomatis</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">📊 Preview Statistik</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {statsConfig.mode === 'auto' ? autoStats.permintaanSelesai : statsConfig.manual.permintaanSelesai}
                </div>
                <div className="text-sm text-gray-600">Permohonan Selesai</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {statsConfig.mode === 'auto' ? autoStats.rataRataHari : statsConfig.manual.rataRataHari}
                </div>
                <div className="text-sm text-gray-600">Rata-rata Hari</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {statsConfig.mode === 'auto' ? autoStats.totalInformasi : statsConfig.manual.totalInformasi}
                </div>
                <div className="text-sm text-gray-600">Total Informasi</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {statsConfig.mode === 'auto' ? autoStats.aksesOnline : statsConfig.manual.aksesOnline}
                </div>
                <div className="text-sm text-gray-600">Akses Online</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              💡 Mode saat ini: <strong>{statsConfig.mode === 'auto' ? 'Otomatis' : 'Manual'}</strong>
            </div>
          </div>

          {statsConfig.mode === 'manual' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                ⚙️ Nilai Manual
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permohonan Selesai
                  </label>
                  <input
                    type="number"
                    value={statsConfig.manual.permintaanSelesai}
                    onChange={(e) => setStatsConfig(prev => ({
                      ...prev,
                      manual: { ...prev.manual, permintaanSelesai: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rata-rata Hari Penyelesaian
                  </label>
                  <input
                    type="number"
                    value={statsConfig.manual.rataRataHari}
                    onChange={(e) => setStatsConfig(prev => ({
                      ...prev,
                      manual: { ...prev.manual, rataRataHari: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Informasi Tersedia
                  </label>
                  <input
                    type="number"
                    value={statsConfig.manual.totalInformasi}
                    onChange={(e) => setStatsConfig(prev => ({
                      ...prev,
                      manual: { ...prev.manual, totalInformasi: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akses Online
                  </label>
                  <input
                    type="text"
                    value={statsConfig.manual.aksesOnline}
                    onChange={(e) => setStatsConfig(prev => ({
                      ...prev,
                      manual: { ...prev.manual, aksesOnline: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="24/7"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "general", label: "🏢 Umum", icon: "🏢" },
    { id: "header", label: "📋 Header & Menu", icon: "📋" },
    { id: "footer", label: "📄 Footer", icon: "📄" },
    { id: "hero", label: "🖼️ Hero Section", icon: "🖼️" },
    { id: "applications", label: "🚀 Aplikasi", icon: "🚀" },
    { id: "stats", label: "📊 Statistik Homepage", icon: "📊" },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
        ⚙️ Pengaturan Website
      </h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b">
          <nav className="flex overflow-x-auto space-x-4 md:space-x-8 px-4 md:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
        {activeTab === "general" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">🏢 Pengaturan Umum</h2>
              <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
                <button
                  onClick={() => resetTabToDefault("general")}
                  disabled={isResettingTab}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  title="Reset pengaturan umum ke default"
                >
                  {isResettingTab ? "⏳" : "🔄"} Reset Tab
                </button>
              </RoleGuard>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Instansi
                </label>
                <input
                  type="text"
                  value={settings.namaInstansi || ""}
                  onChange={(e) => handleChange("namaInstansi", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Website
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const response = await fetch("/api/upload/image", {
                              method: "POST",
                              body: formData,
                            });
                            const result = await response.json();
                            if (result.success) {
                              handleChange("logo", result.url);
                              setToast({ message: 'Logo berhasil diupload!', type: 'success' });
                            } else {
                              setToast({ message: 'Gagal upload logo: ' + result.error, type: 'error' });
                            }
                          } catch {
                            setToast({ message: 'Gagal upload logo', type: 'error' });
                          }
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <span className="text-xs text-gray-500">atau</span>
                  </div>
                  <input
                    type="url"
                    value={settings.logo || ""}
                    onChange={(e) => handleChange("logo", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">📝 Rekomendasi Logo:</p>
                    <ul className="space-y-1">
                      <li>• Ukuran: 200x200 pixels (1:1 rasio)</li>
                      <li>• Format: PNG dengan background transparan</li>
                      <li>• Ukuran file: Maksimal 2MB</li>
                      <li>• Resolusi tinggi untuk tampilan yang tajam</li>
                    </ul>
                  </div>
                  {settings.logo && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview Logo:
                      </p>
                      <Image
                        src={`${settings.logo}?v=${Date.now()}`}
                        alt="Logo Preview"
                        width={64}
                        height={64}
                        className="h-16 w-auto border rounded-lg"
                        unoptimized
                        onError={(e) => {
                          console.log('Logo preview error:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log('Logo preview loaded:', settings.logo)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Website (Title Tag)
                </label>
                <input
                  type="text"
                  value={settings.websiteTitle || ""}
                  onChange={(e) => handleChange("websiteTitle", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Judul yang akan muncul di tab browser"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Website (Meta Description)
                </label>
                <textarea
                  rows={3}
                  value={settings.websiteDescription || ""}
                  onChange={(e) =>
                    handleChange("websiteDescription", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi website untuk SEO dan media sosial"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Kontak
                </label>
                <input
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={settings.telepon || ""}
                  onChange={(e) => handleChange("telepon", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  rows={3}
                  value={settings.alamat || ""}
                  onChange={(e) => handleChange("alamat", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">📢 Marquee Text Running</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.marqueeEnabled || false}
                      onChange={(e) => handleChange("marqueeEnabled", e.target.checked)}
                      className="mr-3"
                    />
                    <span className="font-medium">Aktifkan Marquee Text</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teks Marquee
                    </label>
                    <input
                      type="text"
                      value={settings.marqueeText || ""}
                      onChange={(e) => handleChange("marqueeText", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Selamat datang di PPID Kabupaten Garut - Layanan Informasi Publik yang Transparan"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Teks yang akan berjalan di bawah hero section (default: mati)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kecepatan Marquee
                      </label>
                      <select
                        value={settings.marqueeSpeed || "slow"}
                        onChange={(e) => handleChange("marqueeSpeed", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="very-slow">Sangat Pelan (45 detik)</option>
                        <option value="slow">Pelan (30 detik)</option>
                        <option value="medium">Sedang (20 detik)</option>
                        <option value="fast">Cepat (10 detik)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ukuran Font (px)
                      </label>
                      <input
                        type="number"
                        value={settings.marqueeFontSize || "14"}
                        onChange={(e) => handleChange("marqueeFontSize", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="10"
                        max="24"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warna Teks
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.marqueeTextColor || "#ffffff"}
                          onChange={(e) => handleChange("marqueeTextColor", e.target.value)}
                          className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.marqueeTextColor || "#ffffff"}
                          onChange={(e) => handleChange("marqueeTextColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warna Background
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.marqueeBackgroundColor || "#2563eb"}
                          onChange={(e) => handleChange("marqueeBackgroundColor", e.target.value)}
                          className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.marqueeBackgroundColor || "#2563eb"}
                          onChange={(e) => handleChange("marqueeBackgroundColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="#2563eb"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ketebalan Font
                    </label>
                    <select
                      value={settings.marqueeFontWeight || "normal"}
                      onChange={(e) => handleChange("marqueeFontWeight", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semi Bold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  
                  {settings.marqueeEnabled && settings.marqueeText && (
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700 mb-2">Live Preview:</p>
                      <div 
                        className="py-2 px-4 rounded overflow-hidden"
                        style={{
                          backgroundColor: settings.marqueeBackgroundColor || "#2563eb",
                          color: settings.marqueeTextColor || "#ffffff"
                        }}
                      >
                        <div 
                          className="whitespace-nowrap"
                          style={{
                            fontSize: `${settings.marqueeFontSize || 14}px`,
                            fontWeight: settings.marqueeFontWeight || "normal"
                          }}
                        >
                          📢 {settings.marqueeText}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon Website
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleFaviconUpload(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <span className="text-xs text-gray-500">atau</span>
                  </div>
                  <input
                    type="url"
                    value={settings.favicon || ""}
                    onChange={(e) => handleChange("favicon", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/favicon.ico"
                  />
                  <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">
                      🔖 Rekomendasi Favicon:
                    </p>
                    <ul className="space-y-1">
                      <li>• Ukuran: 32x32 pixels (standar favicon)</li>
                      <li>• Format: ICO, PNG, atau SVG</li>
                      <li>• Ukuran file: Maksimal 100KB</li>
                      <li>• Desain sederhana dan mudah dikenali</li>
                      <li>• Kontras tinggi untuk visibilitas yang baik</li>
                    </ul>
                  </div>
                  {settings.favicon && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview Favicon:
                      </p>
                      <Image
                        src={`${settings.favicon}?v=${Date.now()}`}
                        alt="Favicon Preview"
                        width={32}
                        height={32}
                        className="h-8 w-8 border rounded"
                        unoptimized
                        onError={(e) => {
                          console.log('Favicon preview error:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log('Favicon preview loaded:', settings.favicon)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "header" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">📋 Header & Menu Navigation</h2>
              <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
                <button
                  onClick={() => resetTabToDefault("header")}
                  disabled={isResettingTab}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  title="Reset pengaturan header ke default"
                >
                  {isResettingTab ? "⏳" : "🔄"} Reset Tab
                </button>
              </RoleGuard>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Menu Items</h3>
                  <button
                    onClick={addMenuItem}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Tambah Menu
                  </button>
                </div>

                <div className="space-y-4">
                  {(headerSettings.menuItems || []).map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700">
                          Menu {index + 1}
                        </h4>
                        <button
                          onClick={() => removeMenuItem(index)}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
                        >
                          🗑️ Hapus Menu
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label Menu
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              updateMenuItem(index, "label", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL
                          </label>
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) =>
                              updateMenuItem(index, "url", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.hasDropdown}
                            onChange={(e) =>
                              updateMenuItem(
                                index,
                                "hasDropdown",
                                e.target.checked
                              )
                            }
                            className="mr-2"
                          />
                          Memiliki Dropdown Menu
                        </label>
                        {item.hasDropdown && (
                          <button
                            onClick={() => addDropdownItem(index)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            + Sub Menu
                          </button>
                        )}
                      </div>

                      {item.hasDropdown && item.dropdownItems.length > 0 && (
                        <div className="ml-4 space-y-2">
                          {(item.dropdownItems || []).map(
                            (dropItem, dropIndex) => (
                              <div
                                key={dropIndex}
                                className="flex gap-2 items-center"
                              >
                                <input
                                  type="text"
                                  value={dropItem.label}
                                  onChange={(e) => {
                                    const newDropdownItems = [
                                      ...item.dropdownItems,
                                    ];
                                    newDropdownItems[dropIndex] = {
                                      ...dropItem,
                                      label: e.target.value,
                                    };
                                    updateMenuItem(
                                      index,
                                      "dropdownItems",
                                      newDropdownItems
                                    );
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Label sub menu"
                                />
                                <input
                                  type="text"
                                  value={dropItem.url}
                                  onChange={(e) => {
                                    const newDropdownItems = [
                                      ...item.dropdownItems,
                                    ];
                                    newDropdownItems[dropIndex] = {
                                      ...dropItem,
                                      url: e.target.value,
                                    };
                                    updateMenuItem(
                                      index,
                                      "dropdownItems",
                                      newDropdownItems
                                    );
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="URL sub menu"
                                />
                                <button
                                  onClick={() =>
                                    removeDropdownItem(index, dropIndex)
                                  }
                                  className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
                                >
                                  🗑️
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "footer" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">📄 Footer Website</h2>
              <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
                <button
                  onClick={() => resetTabToDefault("footer")}
                  disabled={isResettingTab}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  title="Reset pengaturan footer ke default"
                >
                  {isResettingTab ? "⏳" : "🔄"} Reset Tab
                </button>
              </RoleGuard>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    value={footerSettings.companyName}
                    onChange={(e) =>
                      handleFooterChange("companyName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={footerSettings.copyrightText}
                    onChange={(e) =>
                      handleFooterChange("copyrightText", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Footer
                </label>
                <textarea
                  rows={3}
                  value={footerSettings.description}
                  onChange={(e) =>
                    handleFooterChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    rows={2}
                    value={footerSettings.address}
                    onChange={(e) =>
                      handleFooterChange("address", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telepon
                    </label>
                    <input
                      type="tel"
                      value={footerSettings.phone}
                      onChange={(e) =>
                        handleFooterChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={footerSettings.email}
                      onChange={(e) =>
                        handleFooterChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Social Media Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={footerSettings.socialMedia?.facebook || ""}
                      onChange={(e) =>
                        handleFooterChange("socialMedia", {
                          ...(footerSettings.socialMedia || {}),
                          facebook: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={footerSettings.socialMedia?.instagram || ""}
                      onChange={(e) =>
                        handleFooterChange("socialMedia", {
                          ...(footerSettings.socialMedia || {}),
                          instagram: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={footerSettings.socialMedia?.twitter || ""}
                      onChange={(e) =>
                        handleFooterChange("socialMedia", {
                          ...(footerSettings.socialMedia || {}),
                          twitter: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={footerSettings.socialMedia?.youtube || ""}
                      onChange={(e) =>
                        handleFooterChange("socialMedia", {
                          ...(footerSettings.socialMedia || {}),
                          youtube: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">⏰ Jam Layanan</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hari Kerja (Senin - Jumat)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Jam Buka
                        </label>
                        <input
                          type="time"
                          value={
                            footerSettings.serviceHours?.weekdayStart || "08:00"
                          }
                          onChange={(e) => {
                            const hours = footerSettings.serviceHours || {};
                            const start = e.target.value;
                            const end = hours.weekdayEnd || "16:00";
                            const weekdays = `Senin - Jumat: ${start} - ${end} WIB`;
                            handleFooterChange("serviceHours", {
                              ...hours,
                              weekdayStart: start,
                              weekdays,
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Jam Tutup
                        </label>
                        <input
                          type="time"
                          value={
                            footerSettings.serviceHours?.weekdayEnd || "16:00"
                          }
                          onChange={(e) => {
                            const hours = footerSettings.serviceHours || {};
                            const start = hours.weekdayStart || "08:00";
                            const end = e.target.value;
                            const weekdays = `Senin - Jumat: ${start} - ${end} WIB`;
                            handleFooterChange("serviceHours", {
                              ...hours,
                              weekdayEnd: end,
                              weekdays,
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              footerSettings.serviceHours?.weekdayClosed ||
                              false
                            }
                            onChange={(e) => {
                              const hours = footerSettings.serviceHours || {};
                              const weekdays = e.target.checked
                                ? "Senin - Jumat: Tutup"
                                : `Senin - Jumat: ${
                                    hours.weekdayStart || "08:00"
                                  } - ${hours.weekdayEnd || "16:00"} WIB`;
                              handleFooterChange("serviceHours", {
                                ...hours,
                                weekdayClosed: e.target.checked,
                                weekdays,
                              });
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">Tutup</span>
                        </label>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      Preview:{" "}
                      {footerSettings.serviceHours?.weekdays ||
                        "Senin - Jumat: 08:00 - 16:00 WIB"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Akhir Pekan (Sabtu - Minggu)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Jam Buka
                        </label>
                        <input
                          type="time"
                          value={
                            footerSettings.serviceHours?.weekendStart || "08:00"
                          }
                          onChange={(e) => {
                            const hours = footerSettings.serviceHours || {};
                            const start = e.target.value;
                            const end = hours.weekendEnd || "12:00";
                            const weekend = hours.weekendClosed
                              ? "Sabtu - Minggu: Tutup"
                              : `Sabtu - Minggu: ${start} - ${end} WIB`;
                            handleFooterChange("serviceHours", {
                              ...hours,
                              weekendStart: start,
                              weekend,
                            });
                          }}
                          disabled={footerSettings.serviceHours?.weekendClosed}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Jam Tutup
                        </label>
                        <input
                          type="time"
                          value={
                            footerSettings.serviceHours?.weekendEnd || "12:00"
                          }
                          onChange={(e) => {
                            const hours = footerSettings.serviceHours || {};
                            const start = hours.weekendStart || "08:00";
                            const end = e.target.value;
                            const weekend = hours.weekendClosed
                              ? "Sabtu - Minggu: Tutup"
                              : `Sabtu - Minggu: ${start} - ${end} WIB`;
                            handleFooterChange("serviceHours", {
                              ...hours,
                              weekendEnd: end,
                              weekend,
                            });
                          }}
                          disabled={footerSettings.serviceHours?.weekendClosed}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              footerSettings.serviceHours?.weekendClosed || true
                            }
                            onChange={(e) => {
                              const hours = footerSettings.serviceHours || {};
                              const weekend = e.target.checked
                                ? "Sabtu - Minggu: Tutup"
                                : `Sabtu - Minggu: ${
                                    hours.weekendStart || "08:00"
                                  } - ${hours.weekendEnd || "12:00"} WIB`;
                              handleFooterChange("serviceHours", {
                                ...hours,
                                weekendClosed: e.target.checked,
                                weekend,
                              });
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">Tutup</span>
                        </label>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      Preview:{" "}
                      {footerSettings.serviceHours?.weekend ||
                        "Sabtu - Minggu: Tutup"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hari Libur Nasional
                    </label>
                    <select
                      value={
                        footerSettings.serviceHours?.holidayStatus || "closed"
                      }
                      onChange={(e) => {
                        const status = e.target.value;
                        const holidays =
                          status === "closed"
                            ? "Hari Libur Nasional: Tutup"
                            : status === "emergency"
                            ? "Hari Libur: Layanan Darurat Saja"
                            : "Hari Libur: Buka Terbatas";
                        handleFooterChange("serviceHours", {
                          ...(footerSettings.serviceHours || {}),
                          holidayStatus: status,
                          holidays,
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="closed">Tutup</option>
                      <option value="emergency">Layanan Darurat Saja</option>
                      <option value="limited">Buka Terbatas</option>
                    </select>
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      Preview:{" "}
                      {footerSettings.serviceHours?.holidays ||
                        "Hari Libur Nasional: Tutup"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  🔗 Link Penting Footer
                </h3>
                <div className="space-y-3">
                  {(footerSettings.quickLinks || []).map((link, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const newLinks = [
                              ...(footerSettings.quickLinks || []),
                            ];
                            newLinks[index] = {
                              ...link,
                              label: e.target.value,
                            };
                            handleFooterChange("quickLinks", newLinks);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Label link"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [
                                ...(footerSettings.quickLinks || []),
                              ];
                              newLinks[index] = {
                                ...link,
                                url: e.target.value,
                              };
                              handleFooterChange("quickLinks", newLinks);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="URL link"
                          />
                          <button
                            onClick={() => {
                              const newLinks = (
                                footerSettings.quickLinks || []
                              ).filter((_, i) => i !== index);
                              handleFooterChange("quickLinks", newLinks);
                            }}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newLinks = [
                        ...(footerSettings.quickLinks || []),
                        { label: "", url: "" },
                      ];
                      handleFooterChange("quickLinks", newLinks);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Tambah Link Baru
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  Pengaturan Tampilan
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={footerSettings.showAddress}
                      onChange={(e) =>
                        handleFooterChange("showAddress", e.target.checked)
                      }
                      className="mr-2"
                    />
                    Tampilkan Alamat
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={footerSettings.showContact}
                      onChange={(e) =>
                        handleFooterChange("showContact", e.target.checked)
                      }
                      className="mr-2"
                    />
                    Tampilkan Kontak (Telepon & Email)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={footerSettings.showSocialMedia}
                      onChange={(e) =>
                        handleFooterChange("showSocialMedia", e.target.checked)
                      }
                      className="mr-2"
                    />
                    Tampilkan Social Media
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={footerSettings.showServiceHours}
                      onChange={(e) =>
                        handleFooterChange("showServiceHours", e.target.checked)
                      }
                      className="mr-2"
                    />
                    Tampilkan Jam Layanan
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={footerSettings.showQuickLinks !== false}
                      onChange={(e) =>
                        handleFooterChange("showQuickLinks", e.target.checked)
                      }
                      className="mr-2"
                    />
                    Tampilkan Link Penting
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">🚀 Pengaturan Aplikasi</h2>
              <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
                <button
                  onClick={() => resetTabToDefault("applications")}
                  disabled={isResettingTab}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  title="Reset pengaturan aplikasi ke default"
                >
                  {isResettingTab ? "⏳" : "🔄"} Reset Tab
                </button>
              </RoleGuard>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">⚙️ Pengaturan Umum</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applicationsSettings.enabled}
                    onChange={(e) => setApplicationsSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="mr-3"
                  />
                  <span className="font-medium">Tampilkan Slider Aplikasi di Homepage</span>
                </label>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">📱 Daftar Aplikasi</h3>
                  <button
                    onClick={() => {
                      const newApp = {
                        id: Date.now().toString(),
                        name: "Aplikasi Baru",
                        logo: "",
                        url: "https://",
                        description: ""
                      };
                      setApplicationsSettings(prev => ({
                        ...prev,
                        apps: [...prev.apps, newApp]
                      }));
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Tambah Aplikasi
                  </button>
                </div>
                
                {applicationsSettings.apps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📱</div>
                    <p>Belum ada aplikasi. Klik "Tambah Aplikasi" untuk menambah aplikasi pertama.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applicationsSettings.apps.map((app, index) => (
                      <div key={app.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">Aplikasi {index + 1}</h4>
                          <button
                            onClick={() => {
                              setApplicationsSettings(prev => ({
                                ...prev,
                                apps: prev.apps.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Aplikasi
                            </label>
                            <input
                              type="text"
                              value={app.name}
                              onChange={(e) => {
                                const newApps = [...applicationsSettings.apps];
                                newApps[index] = { ...app, name: e.target.value };
                                setApplicationsSettings(prev => ({ ...prev, apps: newApps }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Nama aplikasi"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL Aplikasi
                            </label>
                            <input
                              type="url"
                              value={app.url}
                              onChange={(e) => {
                                const newApps = [...applicationsSettings.apps];
                                newApps[index] = { ...app, url: e.target.value };
                                setApplicationsSettings(prev => ({ ...prev, apps: newApps }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="https://aplikasi.example.com"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Deskripsi (Opsional)
                            </label>
                            <input
                              type="text"
                              value={app.description || ""}
                              onChange={(e) => {
                                const newApps = [...applicationsSettings.apps];
                                newApps[index] = { ...app, description: e.target.value };
                                setApplicationsSettings(prev => ({ ...prev, apps: newApps }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Deskripsi singkat aplikasi"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logo Aplikasi
                            </label>
                            <div className="space-y-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    try {
                                      const response = await fetch("/api/upload/image", {
                                        method: "POST",
                                        body: formData,
                                      });
                                      const result = await response.json();
                                      if (result.success) {
                                        const newApps = [...applicationsSettings.apps];
                                        newApps[index] = { ...app, logo: result.url };
                                        setApplicationsSettings(prev => ({ ...prev, apps: newApps }));
                                        setToast({ message: 'Logo berhasil diupload!', type: 'success' });
                                      } else {
                                        setToast({ message: 'Gagal upload logo: ' + result.error, type: 'error' });
                                      }
                                    } catch {
                                      setToast({ message: 'Gagal upload logo', type: 'error' });
                                    }
                                  }
                                }}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              <input
                                type="url"
                                value={app.logo}
                                onChange={(e) => {
                                  const newApps = [...applicationsSettings.apps];
                                  newApps[index] = { ...app, logo: e.target.value };
                                  setApplicationsSettings(prev => ({ ...prev, apps: newApps }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="atau masukkan URL logo"
                              />
                              {app.logo && (
                                <div className="flex items-center gap-3">
                                  <img
                                    src={app.logo}
                                    alt={app.name}
                                    className="w-12 h-12 object-contain border rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <span className="text-sm text-gray-600">Preview logo</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tips:</strong> Logo aplikasi akan ditampilkan dalam slider di homepage. 
                    Gunakan logo dengan rasio 1:1 (persegi) untuk hasil terbaik.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && <StatsSettings />}

        {activeTab === "hero" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">🖼️ Hero Section Homepage</h2>
              <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
                <button
                  onClick={() => resetTabToDefault("hero")}
                  disabled={isResettingTab}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  title="Reset pengaturan hero section ke default"
                >
                  {isResettingTab ? "⏳" : "🔄"} Reset Tab
                </button>
              </RoleGuard>
            </div>
            
            {/* Live Preview Section */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">👁️</span>
                Live Preview - {heroSettings.isCarousel ? 'Carousel Mode' : 'Static Hero'}
              </h3>
              {heroSettings.isCarousel && heroSettings.slides.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <button
                      onClick={() => setPreviewSlideIndex(prev => prev > 0 ? prev - 1 : heroSettings.slides.length - 1)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      ← Prev
                    </button>
                    <span className="font-medium text-gray-700">
                      Slide {previewSlideIndex + 1} / {heroSettings.slides.length}
                    </span>
                    <button
                      onClick={() => setPreviewSlideIndex(prev => prev < heroSettings.slides.length - 1 ? prev + 1 : 0)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Next →
                    </button>
                  </div>
                  <HeroPreview slide={heroSettings.slides[previewSlideIndex]} />
                  <div className="flex gap-2 justify-center">
                    {heroSettings.slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewSlideIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx === previewSlideIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : !heroSettings.isCarousel ? (
                <HeroPreview slide={heroSettings} isStatic={true} />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">🎠</div>
                  <p className="text-gray-600 font-medium">Carousel aktif tapi belum ada slide</p>
                  <p className="text-sm text-gray-500 mt-2">Tambahkan slide pertama untuk melihat preview</p>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Utama
                </label>
                <input
                  type="text"
                  value={heroSettings.title}
                  onChange={(e) => handleHeroChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={heroSettings.subtitle}
                  onChange={(e) => handleHeroChange("subtitle", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={heroSettings.description}
                  onChange={(e) =>
                    handleHeroChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">🎨 Pengaturan Background</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Background
                    </label>
                    <select
                      value={heroSettings.backgroundType || "gradient"}
                      onChange={(e) => setHeroSettings(prev => ({ ...prev, backgroundType: e.target.value as 'gradient' | 'image' | 'solid' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gradient">Gradient (Default)</option>
                      <option value="solid">Solid Color</option>
                      <option value="image">Image</option>
                    </select>
                  </div>

                  {heroSettings.backgroundType === 'gradient' && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CSS Gradient
                        </label>
                        <textarea
                          rows={2}
                          value={heroSettings.backgroundGradient || ""}
                          onChange={(e) => setHeroSettings(prev => ({ ...prev, backgroundGradient: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                          placeholder="linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)"
                        />
                      </div>
                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        💡 <strong>Preset Gradients:</strong>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button onClick={() => setHeroSettings(prev => ({ ...prev, backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)' }))} className="text-left px-2 py-1 bg-white rounded hover:bg-gray-100">🔵 Blue Default</button>
                          <button onClick={() => setHeroSettings(prev => ({ ...prev, backgroundGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }))} className="text-left px-2 py-1 bg-white rounded hover:bg-gray-100">💙 Blue Light</button>
                          <button onClick={() => setHeroSettings(prev => ({ ...prev, backgroundGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }))} className="text-left px-2 py-1 bg-white rounded hover:bg-gray-100">💜 Purple</button>
                          <button onClick={() => setHeroSettings(prev => ({ ...prev, backgroundGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }))} className="text-left px-2 py-1 bg-white rounded hover:bg-gray-100">💚 Green</button>
                          <button onClick={() => setHeroSettings(prev => ({ ...prev, backgroundGradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }))} className="text-left px-2 py-1 bg-white rounded hover:bg-gray-100">❤️ Red</button>
                          <button onClick={() => setHeroSettings(prev => ({ ...prev, backgroundGradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }))} className="text-left px-2 py-1 bg-white rounded hover:bg-gray-100">⚫ Dark</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {heroSettings.backgroundType === 'solid' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={heroSettings.backgroundColor || "#0f172a"}
                          onChange={(e) => setHeroSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={heroSettings.backgroundColor || "#0f172a"}
                          onChange={(e) => setHeroSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="#0f172a"
                        />
                      </div>
                    </div>
                  )}

                  {heroSettings.backgroundType === 'image' && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Image
                        </label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <input
                            type="url"
                            value={heroSettings.backgroundImage}
                            onChange={(e) => handleHeroChange("backgroundImage", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/hero-bg.jpg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Posisi Background
                        </label>
                        <select
                          value={heroSettings.backgroundPosition || "cover"}
                          onChange={(e) => setHeroSettings(prev => ({ ...prev, backgroundPosition: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="cover">Cover - Gambar menutupi area</option>
                          <option value="contain">Contain - Gambar utuh terlihat</option>
                          <option value="center">Center - Posisi tengah</option>
                          <option value="top">Top - Posisi atas</option>
                          <option value="bottom">Bottom - Posisi bawah</option>
                          <option value="left">Left - Posisi kiri</option>
                          <option value="right">Right - Posisi kanan</option>
                          <option value="fill">Fill - Regangkan penuh</option>
                        </select>
                      </div>
                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        📝 Rekomendasi: 1920x1080px, JPG/PNG/WebP, max 5MB
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">🎨 Style Teks Hero</h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warna Judul</label>
                      <input type="color" value={heroSettings.titleColor || "#ffffff"} onChange={(e) => setHeroSettings(prev => ({ ...prev, titleColor: e.target.value }))} className="w-full h-10 border rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Font</label>
                      <input type="text" value={heroSettings.titleFontSize || "32px"} onChange={(e) => setHeroSettings(prev => ({ ...prev, titleFontSize: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="32px" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ketebalan</label>
                      <select value={heroSettings.titleFontWeight || "bold"} onChange={(e) => setHeroSettings(prev => ({ ...prev, titleFontWeight: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                        <option value="normal">Normal</option>
                        <option value="500">Medium</option>
                        <option value="600">Semibold</option>
                        <option value="bold">Bold</option>
                        <option value="800">Extra Bold</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warna Subtitle</label>
                      <input type="color" value={heroSettings.subtitleColor || "#ffffff"} onChange={(e) => setHeroSettings(prev => ({ ...prev, subtitleColor: e.target.value }))} className="w-full h-10 border rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Subtitle</label>
                      <input type="text" value={heroSettings.subtitleFontSize || "14px"} onChange={(e) => setHeroSettings(prev => ({ ...prev, subtitleFontSize: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="14px" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warna Deskripsi</label>
                      <input type="color" value={heroSettings.descriptionColor || "#bfdbfe"} onChange={(e) => setHeroSettings(prev => ({ ...prev, descriptionColor: e.target.value }))} className="w-full h-10 border rounded cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Deskripsi</label>
                      <input type="text" value={heroSettings.descriptionFontSize || "14px"} onChange={(e) => setHeroSettings(prev => ({ ...prev, descriptionFontSize: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="14px" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">🔘 Style Tombol CTA</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teks Tombol</label>
                      <input type="text" value={heroSettings.ctaText} onChange={(e) => handleHeroChange("ctaText", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL Tujuan</label>
                      <input type="text" value={heroSettings.ctaUrl} onChange={(e) => handleHeroChange("ctaUrl", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background</label>
                        <input type="color" value={heroSettings.ctaBackground || "#ffffff"} onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaBackground: e.target.value }))} className="w-full h-10 border rounded cursor-pointer" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                        <input type="color" value={heroSettings.ctaTextColor || "#1e40af"} onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaTextColor: e.target.value }))} className="w-full h-10 border rounded cursor-pointer" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                        <input type="text" value={heroSettings.ctaBorderRadius || "8px"} onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaBorderRadius: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="8px" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                        <input type="text" value={heroSettings.ctaPadding || "10px 20px"} onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaPadding: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="10px 20px" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                        <input type="text" value={heroSettings.ctaFontSize || "14px"} onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaFontSize: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="14px" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Weight</label>
                        <select value={heroSettings.ctaFontWeight || "600"} onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaFontWeight: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                          <option value="normal">Normal</option>
                          <option value="500">Medium</option>
                          <option value="600">Semibold</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Posisi</label>
                        <select value={heroSettings.ctaPosition || "center"} onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaPosition: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                          <option value="left">Kiri</option>
                          <option value="center">Tengah</option>
                          <option value="right">Kanan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS Tambahan (Opsional)</label>
                    <textarea rows={2} value={heroSettings.ctaCustomCss || ""} onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaCustomCss: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs" placeholder="box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #000;" />
                    <p className="text-xs text-gray-500 mt-1">Untuk style lanjutan seperti shadow, border, transform, dll</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">
                  🎨 Pengaturan Overlay & Style
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={heroSettings.cleanTemplate}
                      onChange={(e) =>
                        setHeroSettings((prev) => ({
                          ...prev,
                          cleanTemplate: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">
                      Gambar Clean (Tanpa Overlay)
                    </span>
                  </label>
                  
                  {!heroSettings.cleanTemplate && (
                    <div className="ml-6 space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warna Overlay
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={heroSettings.overlayColor || "#0f172a"}
                              onChange={(e) => setHeroSettings(prev => ({ ...prev, overlayColor: e.target.value }))}
                              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={heroSettings.overlayColor || "#0f172a"}
                              onChange={(e) => setHeroSettings(prev => ({ ...prev, overlayColor: e.target.value }))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                              placeholder="#0f172a"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opacity ({Math.round((heroSettings.overlayOpacity ?? 0.7) * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={heroSettings.overlayOpacity ?? 0.7}
                            onChange={(e) => setHeroSettings(prev => ({ ...prev, overlayOpacity: parseFloat(e.target.value) }))}
                            className="w-full h-10"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        💡 Overlay membantu teks lebih terbaca di atas gambar
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Carousel Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">
                  🎠 Pengaturan Carousel
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={heroSettings.isCarousel}
                      onChange={(e) =>
                        setHeroSettings((prev) => ({
                          ...prev,
                          isCarousel: e.target.checked,
                        }))
                      }
                      className="mr-3"
                    />
                    <span className="font-medium">Aktifkan Mode Carousel</span>
                  </label>

                  {heroSettings.isCarousel && (
                    <div className="ml-6 space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={heroSettings.autoSlide}
                              onChange={(e) =>
                                setHeroSettings((prev) => ({
                                  ...prev,
                                  autoSlide: e.target.checked,
                                }))
                              }
                              className="mr-2"
                            />
                            Auto Slide
                          </label>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Interval (ms)
                            </label>
                            <input
                              type="number"
                              value={heroSettings.slideInterval}
                              onChange={(e) =>
                                setHeroSettings((prev) => ({
                                  ...prev,
                                  slideInterval: parseInt(e.target.value),
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="2000"
                              step="1000"
                              placeholder="4000 (4 detik - optimal)"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={heroSettings.showCarouselCTA}
                              onChange={(e) =>
                                setHeroSettings((prev) => ({
                                  ...prev,
                                  showCarouselCTA: e.target.checked,
                                }))
                              }
                              className="mr-2"
                            />
                            Tampilkan Tombol CTA
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={heroSettings.cleanTemplate}
                              onChange={(e) =>
                                setHeroSettings((prev) => ({
                                  ...prev,
                                  cleanTemplate: e.target.checked,
                                }))
                              }
                              className="mr-2"
                            />
                            Template Bersih (Tanpa Overlay)
                          </label>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">
                            📷 Rekomendasi Gambar Carousel
                          </h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>
                              • <strong>Ukuran:</strong> 1920x1080 pixels (Full
                              HD 16:9)
                            </li>
                            <li>
                              • <strong>Format:</strong> JPG, PNG, WebP
                            </li>
                            <li>
                              • <strong>Ukuran File:</strong> Maksimal 2MB per
                              gambar
                            </li>
                            <li>
                              • <strong>Kualitas:</strong> Resolusi tinggi,
                              kontras baik
                            </li>
                            <li>
                              • <strong>Auto Crop:</strong> Gambar akan otomatis
                              disesuaikan ke 16:9
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Slides Carousel</h4>
                          <button
                            onClick={addSlide}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            + Tambah Slide
                          </button>
                        </div>

                        <div className="space-y-4">
                          {(heroSettings.slides || []).map((slide, index) => (
                            <div
                              key={slide.id}
                              className="border rounded-lg p-4 bg-gray-50"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-medium">
                                  Slide {index + 1}
                                </h5>
                                <button
                                  onClick={() => removeSlide(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  🗑️ Hapus
                                </button>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gambar Slide
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadSlideImage(file, index);
                                      }}
                                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
                                    />
                                  </div>
                                  <input
                                    type="url"
                                    value={slide.image}
                                    onChange={(e) =>
                                      updateSlide(
                                        index,
                                        "image",
                                        e.target.value
                                      )
                                    }
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="atau masukkan URL gambar"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Judul Slide
                                    </label>
                                    <input
                                      type="text"
                                      value={slide.title}
                                      onChange={(e) =>
                                        updateSlide(
                                          index,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Subtitle Slide
                                    </label>
                                    <input
                                      type="text"
                                      value={slide.subtitle}
                                      onChange={(e) =>
                                        updateSlide(
                                          index,
                                          "subtitle",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi Slide
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={slide.description}
                                    onChange={(e) =>
                                      updateSlide(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  ></textarea>
                                </div>

                                <div className="border-t pt-3 mt-3">
                                  <h4 className="text-sm font-medium text-gray-700 mb-3">🎨 Style Teks Slide</h4>
                                  <div className="space-y-3 bg-gray-50 p-3 rounded">
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Warna Judul</label>
                                        <input type="color" value={slide.titleColor || "#ffffff"} onChange={(e) => updateSlide(index, "titleColor", e.target.value)} className="w-full h-8 border rounded cursor-pointer" />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Ukuran</label>
                                        <input type="text" value={slide.titleFontSize || "32px"} onChange={(e) => updateSlide(index, "titleFontSize", e.target.value)} className="w-full px-2 py-1 border rounded text-xs" placeholder="32px" />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Ketebalan</label>
                                        <select value={slide.titleFontWeight || "bold"} onChange={(e) => updateSlide(index, "titleFontWeight", e.target.value)} className="w-full px-2 py-1 border rounded text-xs">
                                          <option value="normal">Normal</option>
                                          <option value="600">Semibold</option>
                                          <option value="bold">Bold</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Warna Subtitle</label>
                                        <input type="color" value={slide.subtitleColor || "#ffffff"} onChange={(e) => updateSlide(index, "subtitleColor", e.target.value)} className="w-full h-8 border rounded cursor-pointer" />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Ukuran Subtitle</label>
                                        <input type="text" value={slide.subtitleFontSize || "14px"} onChange={(e) => updateSlide(index, "subtitleFontSize", e.target.value)} className="w-full px-2 py-1 border rounded text-xs" placeholder="14px" />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Warna Deskripsi</label>
                                        <input type="color" value={slide.descriptionColor || "#bfdbfe"} onChange={(e) => updateSlide(index, "descriptionColor", e.target.value)} className="w-full h-8 border rounded cursor-pointer" />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Ukuran Deskripsi</label>
                                        <input type="text" value={slide.descriptionFontSize || "14px"} onChange={(e) => updateSlide(index, "descriptionFontSize", e.target.value)} className="w-full px-2 py-1 border rounded text-xs" placeholder="14px" />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Posisi Gambar
                                  </label>
                                  <select
                                    value={slide.backgroundPosition || "cover"}
                                    onChange={(e) =>
                                      updateSlide(
                                        index,
                                        "backgroundPosition",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="cover">
                                      Cover (Default) - Gambar menutupi area
                                    </option>
                                    <option value="contain">
                                      Contain - Gambar utuh terlihat
                                    </option>
                                    <option value="center">
                                      Center - Posisi tengah
                                    </option>
                                    <option value="top">
                                      Top - Posisi atas
                                    </option>
                                    <option value="bottom">
                                      Bottom - Posisi bawah
                                    </option>
                                    <option value="left">
                                      Left - Posisi kiri
                                    </option>
                                    <option value="right">
                                      Right - Posisi kanan
                                    </option>
                                    <option value="fill">
                                      Fill - Regangkan penuh
                                    </option>
                                  </select>
                                </div>

                                <div className="border-t pt-3 mt-3">
                                  <label className="flex items-center mb-3">
                                    <input
                                      type="checkbox"
                                      checked={slide.ctaEnabled || false}
                                      onChange={(e) =>
                                        updateSlide(
                                          index,
                                          "ctaEnabled",
                                          e.target.checked
                                        )
                                      }
                                      className="mr-2"
                                    />
                                    <span className="text-sm font-medium">
                                      Aktifkan Tombol CTA
                                    </span>
                                  </label>
                                  
                                  {slide.ctaEnabled && (
                                    <div className="ml-6 space-y-3">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Teks Tombol CTA
                                          </label>
                                          <input
                                            type="text"
                                            value={slide.ctaText ?? ""}
                                            onChange={(e) =>
                                              updateSlide(
                                                index,
                                                "ctaText",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Contoh: Selengkapnya"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL Tujuan CTA
                                          </label>
                                          <input
                                            type="text"
                                            value={slide.ctaUrl ?? ""}
                                            onChange={(e) =>
                                              updateSlide(
                                                index,
                                                "ctaUrl",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="/halaman-tujuan"
                                          />
                                        </div>
                                      </div>
                                      <div className="bg-gray-50 p-3 rounded space-y-3">
                                        <h5 className="text-xs font-medium text-gray-700">🔘 Style Tombol CTA</h5>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-xs text-gray-600 mb-1">Warna Background</label>
                                            <input type="color" value={slide.ctaBackground || "#ffffff"} onChange={(e) => updateSlide(index, "ctaBackground", e.target.value)} className="w-full h-8 border rounded cursor-pointer" />
                                          </div>
                                          <div>
                                            <label className="block text-xs text-gray-600 mb-1">Warna Teks</label>
                                            <input type="color" value={slide.ctaTextColor || "#1e40af"} onChange={(e) => updateSlide(index, "ctaTextColor", e.target.value)} className="w-full h-8 border rounded cursor-pointer" />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                          <div>
                                            <label className="block text-xs text-gray-600 mb-1">Border Radius</label>
                                            <input type="text" value={slide.ctaBorderRadius || "8px"} onChange={(e) => updateSlide(index, "ctaBorderRadius", e.target.value)} className="w-full px-2 py-1 border rounded text-xs" placeholder="8px" />
                                          </div>
                                          <div>
                                            <label className="block text-xs text-gray-600 mb-1">Padding</label>
                                            <input type="text" value={slide.ctaPadding || "10px 20px"} onChange={(e) => updateSlide(index, "ctaPadding", e.target.value)} className="w-full px-2 py-1 border rounded text-xs" placeholder="10px 20px" />
                                          </div>
                                          <div>
                                            <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                                            <input type="text" value={slide.ctaFontSize || "14px"} onChange={(e) => updateSlide(index, "ctaFontSize", e.target.value)} className="w-full px-2 py-1 border rounded text-xs" placeholder="14px" />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
                                            <select value={slide.ctaFontWeight || "600"} onChange={(e) => updateSlide(index, "ctaFontWeight", e.target.value)} className="w-full px-2 py-1 border rounded text-xs">
                                              <option value="normal">Normal</option>
                                              <option value="600">Semibold</option>
                                              <option value="bold">Bold</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-xs text-gray-600 mb-1">Posisi</label>
                                            <select value={slide.ctaPosition ?? "center"} onChange={(e) => updateSlide(index, "ctaPosition", e.target.value)} className="w-full px-2 py-1 border rounded text-xs">
                                              <option value="left">Kiri</option>
                                              <option value="center">Tengah</option>
                                              <option value="right">Kanan</option>
                                            </select>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Custom CSS Tambahan (Opsional)
                                        </label>
                                        <textarea
                                          rows={2}
                                          value={slide.ctaCustomCss ?? ""}
                                          onChange={(e) =>
                                            updateSlide(
                                              index,
                                              "ctaCustomCss",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                                          placeholder="box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                          Untuk style lanjutan seperti shadow, border, transform
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="border-t pt-3 mt-3">
                                  <label className="flex items-center mb-3">
                                    <input
                                      type="checkbox"
                                      checked={slide.cleanImage ?? true}
                                      onChange={(e) =>
                                        updateSlide(
                                          index,
                                          "cleanImage",
                                          e.target.checked
                                        )
                                      }
                                      className="mr-2"
                                    />
                                    <span className="text-sm font-medium">
                                      Gambar Clean (Tanpa Overlay)
                                    </span>
                                  </label>
                                  
                                  {!slide.cleanImage && (
                                    <div className="ml-6 space-y-3">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Warna Overlay
                                          </label>
                                          <div className="flex gap-2">
                                            <input
                                              type="color"
                                              value={slide.overlayColor ?? "#0f172a"}
                                              onChange={(e) =>
                                                updateSlide(
                                                  index,
                                                  "overlayColor",
                                                  e.target.value
                                                )
                                              }
                                              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                            />
                                            <input
                                              type="text"
                                              value={slide.overlayColor ?? "#0f172a"}
                                              onChange={(e) =>
                                                updateSlide(
                                                  index,
                                                  "overlayColor",
                                                  e.target.value
                                                )
                                              }
                                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                              placeholder="#0f172a"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Opacity ({Math.round((slide.overlayOpacity ?? 0.7) * 100)}%)
                                          </label>
                                          <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={slide.overlayOpacity ?? 0.7}
                                            onChange={(e) =>
                                              updateSlide(
                                                index,
                                                "overlayOpacity",
                                                e.target.value
                                              )
                                            }
                                            className="w-full h-10"
                                          />
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                                        💡 Overlay membantu teks lebih terbaca di atas gambar
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {slide.image && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                      Preview Slide:
                                    </p>
                                    <HeroPreview slide={slide} />
                                    <p className="text-xs text-gray-500 mt-2">
                                      Mode: <strong>{slide.backgroundPosition || "cover"}</strong>
                                      {slide.cleanImage && " • Clean Image"}
                                      {!slide.cleanImage && ` • Overlay ${Math.round((slide.overlayOpacity ?? 0.7) * 100)}%`}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {heroSettings.slides.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>
                              Belum ada slide. Klik &quot;Tambah Slide&quot;
                              untuk menambah slide pertama.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">💡 Bantuan Pengaturan</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>Simpan:</strong> Menyimpan semua perubahan pengaturan</p>
              <p>• <strong>Reset ke Default:</strong> Mengembalikan semua pengaturan ke nilai awal (hanya Admin)</p>
              <p>• <strong>Lihat Homepage:</strong> Membuka halaman utama untuk melihat hasil perubahan</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isSaving ? "⏳ Menyimpan..." : "💾 Simpan Semua Pengaturan"}
            </button>
            <button
              onClick={resetToDefault}
              disabled={isResetting || isSaving}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              title="Mengembalikan semua pengaturan ke nilai default"
            >
              {isResetting ? "⏳ Mereset..." : "🔄 Reset ke Default"}
            </button>
            <button
              onClick={() => window.open("/", "_blank")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              title="Membuka halaman utama di tab baru untuk melihat hasil perubahan"
            >
              👁️ Lihat Homepage
            </button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Modals and Toast */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil Disimpan!"
        message="Semua pengaturan berhasil disimpan dan akan diterapkan pada website."
      />
      
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          confirmAction();
          setShowConfirmModal(false);
        }}
        title={confirmTitle}
        message={confirmMessage}
        type="warning"
        confirmText="Ya, Reset"
        cancelText="Batal"
      />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
