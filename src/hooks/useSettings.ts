"use client";

import { useState, useEffect } from 'react';

interface GeneralSettings {
  namaInstansi: string;
  logo: string;
  email: string;
  telepon: string;
  alamat: string;
  websiteTitle: string;
  websiteDescription: string;
}

interface HeaderSettings {
  menuItems: Array<{
    label: string;
    url: string;
    hasDropdown: boolean;
    dropdownItems: Array<{
      label: string;
      url: string;
    }>;
  }>;
}

interface FooterSettings {
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  quickLinks: Array<{
    label: string;
    url: string;
  }>;
}

interface StyleSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

interface HeroSettings {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaUrl: string;
  slides?: Array<{
    title: string;
    subtitle: string;
    image: string;
    ctaText?: string;
    ctaUrl?: string;
  }>;
}

interface Settings {
  general: GeneralSettings;
  header: HeaderSettings;
  footer: FooterSettings;
  style: StyleSettings;
  hero: HeroSettings;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings?t=${Date.now()}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Non-JSON response from settings API, using defaults');
        return;
      }
      
      if (!response.ok) {
        console.warn(`Settings API returned ${response.status}, using defaults`);
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setSettings(result.data);
        
        // Force re-render by dispatching a custom event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('settingsLoaded', { detail: result.data }));
        }, 100);
      } else {
        console.warn('Settings API returned invalid data:', result);
      }
    } catch (error) {
      console.warn('Failed to load settings, using defaults:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Listen for settings changes
    const handleSettingsChange = () => {
      console.log('Settings change event received, reloading...');
      loadSettings();
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    
    // Also listen for storage changes in case settings are updated in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settingsUpdated') {
        loadSettings();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { settings, loading, refetch: loadSettings };
};