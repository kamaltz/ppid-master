"use client";

// src/app/page.tsx
import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import MarqueeText from "@/components/MarqueeText";
import ApplicationsSlider from "@/components/ApplicationsSlider";
import NewsPortal from "@/components/NewsPortal";
import ServiceSection from "@/components/ServiceSection";
import StatsSection from "@/components/StatsSection";
import AccessibilityHelper from "@/components/accessibility/AccessibilityHelper";

export default function Home() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success) {
          console.log('Homepage settings:', data.data);
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <main>
        <HeroSection />
        <ServiceSection />
        <NewsPortal />
        <StatsSection />
        <AccessibilityHelper />
      </main>
    );
  }
  
  return (
    <main>
      <HeroSection />
      
      <MarqueeText 
        text={settings.general?.marqueeText || ''}
        enabled={settings.general?.marqueeEnabled || false}
        speed={settings.general?.marqueeSpeed || 'slow'}
      />
      
      {settings.applications?.enabled && (
        <ApplicationsSlider 
          applications={settings.applications?.apps || []}
        />
      )}

      <ServiceSection />

      <NewsPortal />

      <StatsSection />
      
      <AccessibilityHelper />
    </main>
  );
}
