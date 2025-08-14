"use client";

import { useState, useEffect } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminPengaturanPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    namaInstansi: 'PPID Diskominfo Kabupaten Garut',
    logo: '',
    email: 'ppid@garutkab.go.id',
    telepon: '(0262) 123456',
    alamat: 'Jl. Pembangunan No. 1, Garut, Jawa Barat',
    websiteTitle: 'PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik',
    websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.'
  });
  const [headerSettings, setHeaderSettings] = useState({
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
  const [footerSettings, setFooterSettings] = useState({
    companyName: 'PPID Kabupaten Garut',
    description: 'PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.',
    address: 'Jl. Pembangunan No. 1, Garut, Jawa Barat',
    phone: '(0262) 123456',
    email: 'ppid@garutkab.go.id',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    quickLinks: [
      { label: 'Beranda', url: '/' },
      { label: 'Profil PPID', url: '/profil' },
      { label: 'DIP', url: '/dip' },
      { label: 'Kontak', url: '/kontak' }
    ],
    copyrightText: 'PPID Kabupaten Garut. Semua hak dilindungi.',
    showAddress: true,
    showContact: true,
    showSocialMedia: true
  });

  const [heroSettings, setHeroSettings] = useState({
    title: 'Selamat Datang di PPID Kabupaten Garut',
    subtitle: 'Pejabat Pengelola Informasi dan Dokumentasi',
    description: 'Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.',
    backgroundImage: '',
    ctaText: 'Ajukan Permohonan',
    ctaUrl: '/permohonan',
    isCarousel: false,
    autoSlide: true,
    slideInterval: 4000,
    showCarouselCTA: false,
    cleanTemplate: false,
    slides: []
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    
    try {
      // Save all settings
      const settingsToSave = [
        { key: 'general', value: settings },
        { key: 'header', value: headerSettings },
        { key: 'footer', value: footerSettings },
        { key: 'hero', value: heroSettings }
      ];
      
      let allSuccess = true;
      
      for (const setting of settingsToSave) {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setting)
        });
        
        if (!response.ok) {
          console.error(`Failed to save ${setting.key}:`, response.status);
          allSuccess = false;
          continue;
        }
        
        const result = await response.json();
        console.log(`Saved ${setting.key}:`, result);
        
        if (!result.success) {
          console.error(`API error for ${setting.key}:`, result.error);
          allSuccess = false;
        }
      }
      
      if (allSuccess) {
        alert('✅ Semua pengaturan berhasil disimpan!');
        
        // Force reload all components by clearing cache
        if (typeof window !== 'undefined') {
          // Clear any cached data
          sessionStorage.clear();
          localStorage.clear();
          
          // Broadcast settings change to all components
          window.dispatchEvent(new CustomEvent('settingsChanged'));
          
          // Force refresh homepage if hero settings changed
          if (window.opener) {
            window.opener.location.reload();
          }
          
          // Reload current page
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } else {
        alert('⚠️ Beberapa pengaturan gagal disimpan. Periksa console untuk detail.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Gagal menyimpan pengaturan: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`);
      const result = await response.json();
      
      console.log('Loaded settings:', result);
      
      if (result.success) {
        if (result.data.general) setSettings(result.data.general);
        if (result.data.header) setHeaderSettings(result.data.header);
        if (result.data.footer) setFooterSettings(result.data.footer);
        if (result.data.hero) {
          const heroData = result.data.hero;
          const slidesWithDefaults = (heroData.slides || []).map(slide => ({
            ...slide,
            ctaText: slide.ctaText ?? '',
            ctaUrl: slide.ctaUrl ?? '',
            backgroundPosition: slide.backgroundPosition ?? 'cover'
          }));
          
          setHeroSettings({
            ...heroData,
            slides: slidesWithDefaults
          });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleHeaderChange = (field: string, value: any) => {
    setHeaderSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleFooterChange = (field: string, value: any) => {
    setFooterSettings(prev => ({ ...prev, [field]: value }));
  };



  const handleHeroChange = (field: string, value: string) => {
    setHeroSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setHeroSettings(prev => ({ ...prev, backgroundImage: result.url }));
        alert('✅ Gambar berhasil diupload!');
      } else {
        alert('❌ Gagal upload gambar: ' + result.error);
      }
    } catch (error) {
      alert('❌ Gagal upload gambar');
    }
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      image: '',
      title: '',
      subtitle: '',
      description: '',
      ctaText: '',
      ctaUrl: '',
      backgroundPosition: 'cover'
    };
    setHeroSettings(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
  };

  const updateSlide = (index: number, field: string, value: string) => {
    setHeroSettings(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => 
        i === index ? { ...slide, [field]: value } : slide
      )
    }));
  };

  const removeSlide = (index: number) => {
    setHeroSettings(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index)
    }));
  };

  const cropAndResizeImage = (file: File, targetWidth = 1920, targetHeight = 1080): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
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
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          const croppedFile = new File([blob!], file.name, { type: file.type });
          resolve(croppedFile);
        }, file.type, 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadSlideImage = async (file: File, slideIndex: number) => {
    try {
      const croppedFile = await cropAndResizeImage(file);
      const formData = new FormData();
      formData.append('file', croppedFile);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        updateSlide(slideIndex, 'image', result.url);
        alert('✅ Gambar slide berhasil diupload dan disesuaikan!');
      } else {
        alert('❌ Gagal upload gambar: ' + result.error);
      }
    } catch (error) {
      alert('❌ Gagal upload gambar');
    }
  };

  const addMenuItem = () => {
    const newItem = { label: '', url: '', hasDropdown: false, dropdownItems: [] };
    setHeaderSettings(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, newItem]
    }));
  };

  const updateMenuItem = (index: number, field: string, value: any) => {
    setHeaderSettings(prev => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addDropdownItem = (menuIndex: number) => {
    const newDropdownItem = { label: '', url: '' };
    setHeaderSettings(prev => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) => 
        i === menuIndex ? {
          ...item,
          dropdownItems: [...item.dropdownItems, newDropdownItem]
        } : item
      )
    }));
  };

  const [isResetting, setIsResetting] = useState(false);
  
  const resetToDefault = async () => {
    if (!confirm('⚠️ Yakin ingin reset semua pengaturan ke default? Semua kustomisasi akan hilang.')) {
      return;
    }
    
    setIsResetting(true);
    
    const defaultSettings = {
      general: {
        namaInstansi: 'PPID Diskominfo Kabupaten Garut',
        logo: '/logo-garut.svg',
        email: 'ppid@garutkab.go.id',
        telepon: '(0262) 123456',
        alamat: 'Jl. Pembangunan No. 1, Garut, Jawa Barat',
        websiteTitle: 'PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik',
        websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.'
      },
      header: {
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
      },
      footer: {
        companyName: 'PPID Kabupaten Garut',
        description: 'PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.',
        address: 'Jl. Pembangunan No. 1, Garut, Jawa Barat',
        phone: '(0262) 123456',
        email: 'ppid@garutkab.go.id',
        socialMedia: { facebook: '', twitter: '', instagram: '', youtube: '' },
        quickLinks: [
          { label: 'Beranda', url: '/' },
          { label: 'Profil PPID', url: '/profil' },
          { label: 'DIP', url: '/dip' },
          { label: 'Kontak', url: '/kontak' }
        ],
        copyrightText: 'PPID Kabupaten Garut. Semua hak dilindungi.',
        showAddress: true,
        showContact: true,
        showSocialMedia: true
      },
      hero: {
        title: 'Selamat Datang di PPID Kabupaten Garut',
        subtitle: 'Pejabat Pengelola Informasi dan Dokumentasi',
        description: 'Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.',
        backgroundImage: '',
        ctaText: 'Ajukan Permohonan',
        ctaUrl: '/permohonan',
        isCarousel: false,
        autoSlide: true,
        slideInterval: 4000,
        slides: []
      }
    };
    
    try {
      for (const [key, value] of Object.entries(defaultSettings)) {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to reset ${key}`);
        }
      }
      
      alert('✅ Pengaturan berhasil direset ke default!');
      loadSettings();
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Reset error:', error);
      alert('❌ Gagal reset pengaturan');
    } finally {
      setIsResetting(false);
    }
  };
  const tabs = [
    { id: 'general', label: '🏢 Umum', icon: '🏢' },
    { id: 'header', label: '📋 Header & Menu', icon: '📋' },
    { id: 'footer', label: '📄 Footer', icon: '📄' },
    { id: 'hero', label: '🖼️ Hero Section', icon: '🖼️' }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">⚙️ Pengaturan Website</h1>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {activeTab === 'general' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">🏢 Pengaturan Umum</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Instansi</label>
                <input 
                  type="text" 
                  value={settings.namaInstansi}
                  onChange={(e) => handleChange('namaInstansi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Website</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const response = await fetch('/api/upload/image', {
                              method: 'POST',
                              body: formData
                            });
                            const result = await response.json();
                            if (result.success) {
                              handleChange('logo', result.url);
                              alert('✅ Logo berhasil diupload!');
                            } else {
                              alert('❌ Gagal upload logo: ' + result.error);
                            }
                          } catch (error) {
                            alert('❌ Gagal upload logo');
                          }
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <span className="text-xs text-gray-500">atau</span>
                  </div>
                  <input 
                    type="url" 
                    value={settings.logo}
                    onChange={(e) => handleChange('logo', e.target.value)}
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
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview Logo:</p>
                      <img src={settings.logo} alt="Logo Preview" className="h-16 w-auto border rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Website (Title Tag)</label>
                <input 
                  type="text" 
                  value={settings.websiteTitle}
                  onChange={(e) => handleChange('websiteTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Judul yang akan muncul di tab browser"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Website (Meta Description)</label>
                <textarea 
                  rows={3}
                  value={settings.websiteDescription}
                  onChange={(e) => handleChange('websiteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi website untuk SEO dan media sosial"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Kontak</label>
                <input 
                  type="email" 
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                <input 
                  type="tel" 
                  value={settings.telepon}
                  onChange={(e) => handleChange('telepon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                <textarea 
                  rows={3}
                  value={settings.alamat}
                  onChange={(e) => handleChange('alamat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              
            </div>
          </div>
        )}

        {activeTab === 'header' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">📋 Header & Menu Navigation</h2>
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
                  {headerSettings.menuItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label Menu</label>
                          <input 
                            type="text" 
                            value={item.label}
                            onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                          <input 
                            type="text" 
                            value={item.url}
                            onChange={(e) => updateMenuItem(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={item.hasDropdown}
                            onChange={(e) => updateMenuItem(index, 'hasDropdown', e.target.checked)}
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
                          {item.dropdownItems.map((dropItem, dropIndex) => (
                            <div key={dropIndex} className="grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                value={dropItem.label}
                                onChange={(e) => {
                                  const newDropdownItems = [...item.dropdownItems];
                                  newDropdownItems[dropIndex] = { ...dropItem, label: e.target.value };
                                  updateMenuItem(index, 'dropdownItems', newDropdownItems);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Label sub menu"
                              />
                              <input 
                                type="text" 
                                value={dropItem.url}
                                onChange={(e) => {
                                  const newDropdownItems = [...item.dropdownItems];
                                  newDropdownItems[dropIndex] = { ...dropItem, url: e.target.value };
                                  updateMenuItem(index, 'dropdownItems', newDropdownItems);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="URL sub menu"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">📄 Footer Website</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
                  <input 
                    type="text" 
                    value={footerSettings.companyName}
                    onChange={(e) => handleFooterChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
                  <input 
                    type="text" 
                    value={footerSettings.copyrightText}
                    onChange={(e) => handleFooterChange('copyrightText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Footer</label>
                <textarea 
                  rows={3}
                  value={footerSettings.description}
                  onChange={(e) => handleFooterChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea 
                    rows={2}
                    value={footerSettings.address}
                    onChange={(e) => handleFooterChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                    <input 
                      type="tel" 
                      value={footerSettings.phone}
                      onChange={(e) => handleFooterChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={footerSettings.email}
                      onChange={(e) => handleFooterChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Social Media Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input 
                      type="url" 
                      value={footerSettings.socialMedia.facebook}
                      onChange={(e) => handleFooterChange('socialMedia', {...footerSettings.socialMedia, facebook: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input 
                      type="url" 
                      value={footerSettings.socialMedia.instagram}
                      onChange={(e) => handleFooterChange('socialMedia', {...footerSettings.socialMedia, instagram: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input 
                      type="url" 
                      value={footerSettings.socialMedia.twitter}
                      onChange={(e) => handleFooterChange('socialMedia', {...footerSettings.socialMedia, twitter: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                    <input 
                      type="url" 
                      value={footerSettings.socialMedia.youtube}
                      onChange={(e) => handleFooterChange('socialMedia', {...footerSettings.socialMedia, youtube: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Pengaturan Tampilan</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={footerSettings.showAddress}
                      onChange={(e) => handleFooterChange('showAddress', e.target.checked)}
                      className="mr-2"
                    />
                    Tampilkan Alamat
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={footerSettings.showContact}
                      onChange={(e) => handleFooterChange('showContact', e.target.checked)}
                      className="mr-2"
                    />
                    Tampilkan Kontak (Telepon & Email)
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={footerSettings.showSocialMedia}
                      onChange={(e) => handleFooterChange('showSocialMedia', e.target.checked)}
                      className="mr-2"
                    />
                    Tampilkan Social Media
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">🖼️ Hero Section Homepage</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Utama</label>
                <input 
                  type="text" 
                  value={heroSettings.title}
                  onChange={(e) => handleHeroChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input 
                  type="text" 
                  value={heroSettings.subtitle}
                  onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea 
                  rows={3}
                  value={heroSettings.description}
                  onChange={(e) => handleHeroChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <span className="text-xs text-gray-500">atau</span>
                  </div>
                  <input 
                    type="url" 
                    value={heroSettings.backgroundImage}
                    onChange={(e) => handleHeroChange('backgroundImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/hero-bg.jpg"
                  />
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">📝 Rekomendasi Ukuran Gambar:</p>
                    <ul className="space-y-1">
                      <li>• Ukuran: 1920x1080 pixels (Full HD)</li>
                      <li>• Format: JPG, PNG, WebP</li>
                      <li>• Ukuran file: Maksimal 5MB</li>
                      <li>• Rasio: 16:9 untuk hasil terbaik</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teks Tombol CTA</label>
                  <input 
                    type="text" 
                    value={heroSettings.ctaText}
                    onChange={(e) => handleHeroChange('ctaText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Tombol CTA</label>
                  <input 
                    type="text" 
                    value={heroSettings.ctaUrl}
                    onChange={(e) => handleHeroChange('ctaUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Carousel Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">🎠 Pengaturan Carousel</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={heroSettings.isCarousel}
                      onChange={(e) => setHeroSettings(prev => ({ ...prev, isCarousel: e.target.checked }))}
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
                              onChange={(e) => setHeroSettings(prev => ({ ...prev, autoSlide: e.target.checked }))}
                              className="mr-2"
                            />
                            Auto Slide
                          </label>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interval (ms)</label>
                            <input 
                              type="number" 
                              value={heroSettings.slideInterval}
                              onChange={(e) => setHeroSettings(prev => ({ ...prev, slideInterval: parseInt(e.target.value) }))}
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
                              onChange={(e) => setHeroSettings(prev => ({ ...prev, showCarouselCTA: e.target.checked }))}
                              className="mr-2"
                            />
                            Tampilkan Tombol CTA
                          </label>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={heroSettings.cleanTemplate}
                              onChange={(e) => setHeroSettings(prev => ({ ...prev, cleanTemplate: e.target.checked }))}
                              className="mr-2"
                            />
                            Template Bersih (Tanpa Overlay)
                          </label>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">📷 Rekomendasi Gambar Carousel</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• <strong>Ukuran:</strong> 1920x1080 pixels (Full HD 16:9)</li>
                            <li>• <strong>Format:</strong> JPG, PNG, WebP</li>
                            <li>• <strong>Ukuran File:</strong> Maksimal 2MB per gambar</li>
                            <li>• <strong>Kualitas:</strong> Resolusi tinggi, kontras baik</li>
                            <li>• <strong>Auto Crop:</strong> Gambar akan otomatis disesuaikan ke 16:9</li>
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
                          {heroSettings.slides.map((slide, index) => (
                            <div key={slide.id} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-medium">Slide {index + 1}</h5>
                                <button 
                                  onClick={() => removeSlide(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  🗑️ Hapus
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Slide</label>
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
                                    onChange={(e) => updateSlide(index, 'image', e.target.value)}
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="atau masukkan URL gambar"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Slide</label>
                                    <input 
                                      type="text" 
                                      value={slide.title}
                                      onChange={(e) => updateSlide(index, 'title', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle Slide</label>
                                    <input 
                                      type="text" 
                                      value={slide.subtitle}
                                      onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Slide</label>
                                  <textarea 
                                    rows={2}
                                    value={slide.description}
                                    onChange={(e) => updateSlide(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  ></textarea>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Posisi Gambar</label>
                                  <select 
                                    value={slide.backgroundPosition || 'cover'}
                                    onChange={(e) => updateSlide(index, 'backgroundPosition', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="cover">Cover (Default) - Gambar menutupi area</option>
                                    <option value="contain">Contain - Gambar utuh terlihat</option>
                                    <option value="center">Center - Posisi tengah</option>
                                    <option value="top">Top - Posisi atas</option>
                                    <option value="bottom">Bottom - Posisi bawah</option>
                                    <option value="left">Left - Posisi kiri</option>
                                    <option value="right">Right - Posisi kanan</option>
                                    <option value="fill">Fill - Regangkan penuh</option>
                                  </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol CTA (Opsional)</label>
                                    <input 
                                      type="text" 
                                      value={slide.ctaText ?? ''}
                                      onChange={(e) => updateSlide(index, 'ctaText', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Contoh: Selengkapnya, Daftar Sekarang"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Tujuan CTA</label>
                                    <input 
                                      type="text" 
                                      value={slide.ctaUrl ?? ''}
                                      onChange={(e) => updateSlide(index, 'ctaUrl', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="/halaman-tujuan atau https://..."
                                    />
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                                  💡 <strong>Tips:</strong> Kosongkan kedua field untuk tidak menampilkan tombol CTA pada slide ini
                                </div>
                                
                                {slide.image && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Live Preview:</p>
                                    <div 
                                      className="w-full h-40 rounded border relative overflow-hidden bg-gray-100"
                                      style={{
                                        backgroundImage: `url(${slide.image})`,
                                        backgroundSize: slide.backgroundPosition === 'fill' ? '100% 100%' : 
                                                       slide.backgroundPosition === 'contain' ? 'contain' : 'cover',
                                        backgroundPosition: ['top', 'bottom', 'left', 'right', 'center'].includes(slide.backgroundPosition || 'cover') 
                                                          ? slide.backgroundPosition : 'center',
                                        backgroundRepeat: 'no-repeat'
                                      }}
                                    >
                                      {(slide.title || slide.subtitle) && (
                                        <div className="absolute bottom-2 left-2 right-2">
                                          <div className="bg-black bg-opacity-50 text-white p-2 rounded text-center">
                                            {slide.title && <h4 className="font-bold text-xs">{slide.title}</h4>}
                                            {slide.subtitle && <p className="text-xs mt-1">{slide.subtitle}</p>}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Mode: <strong>{slide.backgroundPosition || 'cover'}</strong>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {heroSettings.slides.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>Belum ada slide. Klik "Tambah Slide" untuk menambah slide pertama.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {heroSettings.backgroundImage && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Preview Background</h3>
                  <div className="w-full h-32 bg-cover bg-center rounded-lg border" style={{backgroundImage: `url(${heroSettings.backgroundImage})`}}></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t">
          <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
            <div className="flex gap-4">
              <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2"
              >
                {isSaving ? '⏳ Menyimpan...' : '💾 Simpan Semua Pengaturan'}
              </button>
              <button 
                onClick={resetToDefault}
                disabled={isResetting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
              >
                {isResetting ? '⏳ Mereset...' : '🔄 Reset ke Default'}
              </button>
              <button 
                onClick={() => window.open('/', '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
              >
                👁️ Lihat Homepage
              </button>
            </div>
          </RoleGuard>
        </div>
      </div>
    </div>
  );
}