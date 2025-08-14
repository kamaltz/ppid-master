"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  ctaText: string;
  ctaUrl: string;
}

interface StyleSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export default function CustomHero() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: 'Selamat Datang di PPID Kabupaten Garut',
    subtitle: 'Pejabat Pengelola Informasi dan Dokumentasi',
    description: 'Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.',
    backgroundImage: '',
    ctaText: 'Ajukan Permohonan',
    ctaUrl: '/permohonan'
  });
  
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#10b981',
    backgroundColor: '#f8fafc',
    textColor: '#1f2937'
  });

  useEffect(() => {
    loadSettings();
    
    // Listen for settings changes
    const handleSettingsChange = () => {
      console.log('Settings changed event received, reloading hero...');
      loadSettings();
    };
    
    window.addEventListener('settingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`);
      const result = await response.json();
      
      if (result.success) {
        if (result.data.hero) setHeroSettings(result.data.hero);
        if (result.data.style) setStyleSettings(result.data.style);
      }
    } catch (error) {
      console.error('Error loading hero settings:', error);
    }
  };

  return (
    <section 
      className="relative min-h-[500px] flex items-center justify-center text-white"
      style={{
        backgroundImage: heroSettings.backgroundImage 
          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroSettings.backgroundImage})`
          : `linear-gradient(135deg, ${styleSettings.primaryColor}, ${styleSettings.secondaryColor})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-semibold mb-4 opacity-90">
            {heroSettings.subtitle}
          </h2>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {heroSettings.title}
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            {heroSettings.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={heroSettings.ctaUrl}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: styleSettings.accentColor,
                color: 'white'
              }}
            >
              {heroSettings.ctaText}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              href="/informasi"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-300"
            >
              Lihat Informasi Publik
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}