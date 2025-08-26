"use client";

import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function DynamicLayout() {
  const { settings } = useSettings();

  // Force favicon refresh when settings change
  useEffect(() => {
    const handleSettingsChange = () => {
      // Force favicon refresh after settings update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  useEffect(() => {
    if (settings?.general) {
      // Update document title
      if (settings.general.websiteTitle) {
        document.title = settings.general.websiteTitle;
      }

      // Update meta description
      if (settings.general.websiteDescription) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', settings.general.websiteDescription);
      }

      // Update Open Graph title
      if (settings.general.websiteTitle) {
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
          ogTitle = document.createElement('meta');
          ogTitle.setAttribute('property', 'og:title');
          document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', settings.general.namaInstansi || settings.general.websiteTitle);
      }

      // Update Open Graph description
      if (settings.general.websiteDescription) {
        let ogDescription = document.querySelector('meta[property="og:description"]');
        if (!ogDescription) {
          ogDescription = document.createElement('meta');
          ogDescription.setAttribute('property', 'og:description');
          document.head.appendChild(ogDescription);
        }
        ogDescription.setAttribute('content', settings.general.websiteDescription);
      }

      // Update favicon
      if (settings.general.favicon) {
        const faviconUrl = settings.general.favicon;
        const timestamp = new Date().getTime();
        
        console.log('Updating favicon to:', faviconUrl);
        
        // Remove existing favicon links
        const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
        existingFavicons.forEach(favicon => favicon.remove());

        // Add new favicon with cache busting
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 
                      faviconUrl.endsWith('.png') ? 'image/png' : 'image/x-icon';
        favicon.href = `${faviconUrl}?v=${timestamp}`;
        document.head.appendChild(favicon);

        // Add shortcut icon
        const shortcutIcon = document.createElement('link');
        shortcutIcon.rel = 'shortcut icon';
        shortcutIcon.href = `${faviconUrl}?v=${timestamp}`;
        document.head.appendChild(shortcutIcon);

        // Add apple-touch-icon for mobile devices
        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.href = `${faviconUrl}?v=${timestamp}`;
        document.head.appendChild(appleTouchIcon);
        
        // Force browser refresh of favicon
        setTimeout(() => {
          const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (link) {
            const newLink = link.cloneNode(true) as HTMLLinkElement;
            newLink.href = `${faviconUrl}?v=${Date.now()}`;
            document.head.removeChild(link);
            document.head.appendChild(newLink);
          }
        }, 100);
      }
    }
  }, [settings]);

  return null;
}