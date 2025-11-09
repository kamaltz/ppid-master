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
  ctaEnabled?: boolean;
  ctaPosition?: string;
  ctaCustomCss?: string;
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
  slides: SlideContent[];
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
    // For static hero, use new background settings
    if (!heroSettings.isCarousel) {
      const bgType = heroSettings.backgroundType || 'gradient';
      
      if (bgType === 'solid') {
        return {
          background: heroSettings.backgroundColor || '#0f172a'
        };
      }
      
      if (bgType === 'gradient') {
        return {
          background: heroSettings.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)'
        };
      }
      
      if (bgType === 'image' && currentContent.image) {
        const position = heroSettings.backgroundPosition || 'cover';
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
        
        const overlayColor = heroSettings.overlayColor || '#0f172a';
        const overlayOpacity = heroSettings.overlayOpacity ?? 0.7;
        
        return {
          backgroundImage: heroSettings.cleanTemplate
            ? `url(${currentContent.image})`
            : `linear-gradient(${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}, ${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}), url(${currentContent.image})`,
          backgroundSize,
          backgroundPosition,
          backgroundRepeat: 'no-repeat'
        };
      }
      
      return {
        background: heroSettings.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)'
      };
    }
    
    // For carousel, use slide-specific settings
    if (!currentContent.image) {
      return {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)'
      };
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
    
    const overlayColor = currentContent.overlayColor || '#0f172a';
    const overlayOpacity = currentContent.overlayOpacity ?? 0.7;
    
    return {
      backgroundImage: (heroSettings.cleanTemplate || currentContent.cleanImage)
        ? `url(${currentContent.image})`
        : `linear-gradient(${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}, ${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}), url(${currentContent.image})`,
      backgroundSize,
      backgroundPosition,
      backgroundRepeat: 'no-repeat'
    };
  };
  
  const sectionStyle = getBackgroundStyle();

  return (
    <section 
      className="text-white relative"
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 py-20 md:py-32 text-center min-h-[70vh] flex flex-col justify-center">
        {!currentContent.cleanImage && !heroSettings.cleanTemplate && (
          <>
            <div className="mb-6">
              <span 
                className="bg-white/20 px-4 py-2 rounded-full font-medium"
                style={{
                  color: currentContent.subtitleColor || heroSettings.subtitleColor || '#ffffff',
                  fontSize: currentContent.subtitleFontSize || heroSettings.subtitleFontSize || '14px'
                }}
              >
                {currentContent.subtitle}
              </span>
            </div>
            <h1 
              className="mb-4 leading-tight"
              style={{
                color: currentContent.titleColor || heroSettings.titleColor || '#ffffff',
                fontSize: currentContent.titleFontSize || heroSettings.titleFontSize || '36px',
                fontWeight: currentContent.titleFontWeight || heroSettings.titleFontWeight || 'bold'
              }}
            >
              {currentContent.title}
            </h1>
            <p 
              className="mb-8 max-w-2xl mx-auto"
              style={{
                color: currentContent.descriptionColor || heroSettings.descriptionColor || '#bfdbfe',
                fontSize: currentContent.descriptionFontSize || heroSettings.descriptionFontSize || '18px'
              }}
            >
              {currentContent.description}
            </p>
          </>
        )}
        {/* CTA Buttons */}
        {heroSettings.isCarousel ? (
          // Carousel mode - show CTA only if ctaEnabled is true and has text/URL
          currentContent.ctaEnabled && currentContent.ctaText && currentContent.ctaUrl && (
            <div className={`flex ${
              currentContent.ctaPosition === 'left' ? 'justify-start' :
              currentContent.ctaPosition === 'right' ? 'justify-end' :
              'justify-center'
            }`}>
              <button 
                onClick={() => router.push(currentContent.ctaUrl || '/permohonan')}
                className="hero-cta-button transition-all flex items-center justify-center"
                style={{
                  background: currentContent.ctaBackground || '#ffffff',
                  color: currentContent.ctaTextColor || '#1e40af',
                  padding: currentContent.ctaPadding || '12px 24px',
                  borderRadius: currentContent.ctaBorderRadius || '8px',
                  fontSize: currentContent.ctaFontSize || '16px',
                  fontWeight: currentContent.ctaFontWeight || '600',
                  ...(currentContent.ctaCustomCss ? Object.fromEntries(
                    currentContent.ctaCustomCss.split(';').filter(s => s.trim()).map(s => {
                      const [key, value] = s.split(':').map(p => p.trim());
                      return [key.replace(/-([a-z])/g, (_, l) => l.toUpperCase()), value];
                    })
                  ) : {})
                }}
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                {currentContent.ctaText}
              </button>
            </div>
          )
        ) : (
          // Static mode - show single CTA button only if not in clean mode and has CTA text
          !heroSettings.cleanTemplate && heroSettings.ctaText && (
            <div className={`flex ${
              heroSettings.ctaPosition === 'left' ? 'justify-start' :
              heroSettings.ctaPosition === 'right' ? 'justify-end' :
              'justify-center'
            }`}>
              <button 
                onClick={handleCTA}
                className="hero-cta-button transition-all flex items-center justify-center"
                style={{
                  background: heroSettings.ctaBackground || '#ffffff',
                  color: heroSettings.ctaTextColor || '#1e40af',
                  padding: heroSettings.ctaPadding || '12px 24px',
                  borderRadius: heroSettings.ctaBorderRadius || '8px',
                  fontSize: heroSettings.ctaFontSize || '16px',
                  fontWeight: heroSettings.ctaFontWeight || '600',
                  ...(heroSettings.ctaCustomCss ? Object.fromEntries(
                    heroSettings.ctaCustomCss.split(';').filter(s => s.trim()).map(s => {
                      const [key, value] = s.split(':').map(p => p.trim());
                      return [key.replace(/-([a-z])/g, (_, l) => l.toUpperCase()), value];
                    })
                  ) : {})
                }}
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                {heroSettings.ctaText}
              </button>
            </div>
          )
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
