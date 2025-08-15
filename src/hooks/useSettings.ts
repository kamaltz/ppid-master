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
  menu: Array<{
    label: string;
    url: string;
    dropdown?: Array<{
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
      const response = await fetch(`/api/settings?t=${Date.now()}`);
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Listen for settings changes
    const handleSettingsChange = () => {
      loadSettings();
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  return { settings, loading, refetch: loadSettings };
};