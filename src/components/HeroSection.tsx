// src/components/HeroSection.tsx
"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface SlideContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  backgroundPosition?: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  ctaText: string;
  ctaUrl: string;
  isCarousel: boolean;
  autoSlide: boolean;
  slideInterval: number;
  showCarouselCTA: boolean;
  cleanTemplate: boolean;
  slides: SlideContent[];
}

const HeroSection = () => {
  const router = useRouter();
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
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
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadHeroSettings = async () => {
      try {
        const response = await fetch(`/api/settings?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const result = await response.json();
        if (result.success && result.data.hero) {
          setHeroSettings(result.data.hero);
        }
      } catch (error) {
        console.error('Error loading hero settings:', error);
      }
    };

    loadHeroSettings();

    // Listen for settings changes
    const handleSettingsChange = () => {
      setTimeout(() => {
        loadHeroSettings();
      }, 100);
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    
    // Also listen for storage changes (in case settings changed in another tab)
    const handleStorageChange = () => {
      loadHeroSettings();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCTA = () => {
    router.push(heroSettings.ctaUrl || '/permohonan');
  };

  const handleDIP = () => {
    router.push('/dip');
  };

  // Auto slide effect
  useEffect(() => {
    if (heroSettings.isCarousel && heroSettings.autoSlide && heroSettings.slides?.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % heroSettings.slides.length);
      }, heroSettings.slideInterval);
      return () => clearInterval(interval);
    }
  }, [heroSettings.isCarousel, heroSettings.autoSlide, heroSettings.slideInterval, heroSettings.slides?.length]);

  const nextSlide = () => {
    if (heroSettings.slides?.length) {
      setCurrentSlide(prev => (prev + 1) % heroSettings.slides.length);
    }
  };

  const prevSlide = () => {
    if (heroSettings.slides?.length) {
      setCurrentSlide(prev => (prev - 1 + heroSettings.slides.length) % heroSettings.slides.length);
    }
  };

  const getCurrentContent = (): SlideContent => {
    if (heroSettings.isCarousel && heroSettings.slides?.length > 0) {
      return heroSettings.slides[currentSlide];
    }
    return {
      title: heroSettings.title,
      subtitle: heroSettings.subtitle,
      description: heroSettings.description,
      image: heroSettings.backgroundImage,
      ctaText: heroSettings.ctaText,
      ctaUrl: heroSettings.ctaUrl
    };
  };

  const currentContent = getCurrentContent();
  
  const getBackgroundStyle = () => {
    if (!currentContent.image) {
      // No background image, let CSS gradient show through
      return {};
    }
    
    const position = currentContent.backgroundPosition || 'cover';
    let backgroundSize = 'cover';
    let backgroundPosition = 'center';
    
    switch (position) {
      case 'contain':
        backgroundSize = 'contain';
        break;
      case 'fill':
        backgroundSize = '100% 100%';
        break;
      case 'top':
      case 'bottom':
      case 'left':
      case 'right':
      case 'center':
        backgroundPosition = position;
        break;
      default:
        backgroundSize = 'cover';
    }
    
    return {
      backgroundImage: heroSettings.cleanTemplate 
        ? `url(${currentContent.image})`
        : `linear-gradient(rgba(15, 23, 42, 0.7), rgba(30, 58, 138, 0.7)), url(${currentContent.image})`,
      backgroundSize,
      backgroundPosition,
      backgroundRepeat: 'no-repeat'
    };
  };
  
  const sectionStyle = getBackgroundStyle();

  return (
    <section 
      className="text-white relative"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)',
        ...sectionStyle
      }}
    >
      <div className="container mx-auto px-4 py-20 md:py-32 text-center min-h-[70vh] flex flex-col justify-center">
        <div className="mb-6">
          <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentContent.subtitle}
          </span>
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${
          heroSettings.cleanTemplate ? 'text-shadow-lg' : ''
        }`}>
          {currentContent.title}
        </h1>
        <p className={`text-lg mb-8 max-w-2xl mx-auto ${
          heroSettings.cleanTemplate ? 'text-white text-shadow' : 'text-blue-100'
        }`}>
          {currentContent.description}
        </p>
        {/* CTA Buttons */}
        {heroSettings.isCarousel ? (
          // Carousel mode - show CTA if slide has CTA text and URL
          currentContent.ctaText && currentContent.ctaUrl && (
            <div className="flex justify-center">
              <button 
                onClick={() => router.push(currentContent.ctaUrl || '/permohonan')}
                className={`font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center ${
                  heroSettings.cleanTemplate 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'bg-white text-blue-800 hover:bg-gray-100'
                }`}
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                {currentContent.ctaText}
              </button>
            </div>
          )
        ) : (
          // Static mode - show default CTA buttons
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleCTA}
              className="bg-white text-blue-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              {heroSettings.ctaText}
            </button>
            <button 
              onClick={handleDIP}
              className="border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:text-blue-800 transition-all"
            >
              Lihat DIP
            </button>
          </div>
        )}
        
        {/* Carousel Controls */}
        {heroSettings.isCarousel && heroSettings.slides?.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroSettings.slides?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
