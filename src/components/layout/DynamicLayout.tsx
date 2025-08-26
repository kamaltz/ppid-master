"use client";

import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function DynamicLayout() {
  const { settings } = useSettings();

  // Force favicon refresh when settings change
  useEffect(() => {
    const handleSettingsChange = () => {
      console.log('Settings changed event received');
      // Clear browser cache and force complete refresh
      setTimeout(() => {
        // Clear localStorage cache
        sessionStorage.removeItem('cachedSettings');
        localStorage.removeItem('faviconCache');
        
        // Force hard reload
        window.location.reload();
      }, 500);
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

      // Update favicon with aggressive cache busting
      if (settings.general.favicon) {
        const faviconUrl = settings.general.favicon;
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        
        console.log('Updating favicon to:', faviconUrl);
        
        // Remove ALL existing favicon and icon links
        const existingIcons = document.querySelectorAll('link[rel*="icon"], link[href*="favicon"]');
        existingIcons.forEach(icon => icon.remove());

        // Create multiple favicon formats for maximum compatibility
        const faviconTypes = [
          { rel: 'icon', type: 'image/x-icon' },
          { rel: 'shortcut icon', type: 'image/x-icon' },
          { rel: 'apple-touch-icon', type: 'image/png' },
          { rel: 'apple-touch-icon-precomposed', type: 'image/png' }
        ];
        
        faviconTypes.forEach((iconType, index) => {
          setTimeout(() => {
            const link = document.createElement('link');
            link.rel = iconType.rel;
            link.type = iconType.type;
            link.href = `${faviconUrl}?v=${timestamp}&r=${randomId}&i=${index}`;
            document.head.appendChild(link);
          }, index * 50);
        });
        
        // Force complete page refresh for favicon update (aggressive approach)
        setTimeout(() => {
          // Clear all caches
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => caches.delete(name));
            });
          }
          
          // Add meta tag to prevent caching
          const noCacheMeta = document.createElement('meta');
          noCacheMeta.httpEquiv = 'Cache-Control';
          noCacheMeta.content = 'no-cache, no-store, must-revalidate';
          document.head.appendChild(noCacheMeta);
          
          console.log('Forcing complete page refresh for favicon update');
          window.location.href = window.location.href.split('?')[0] + '?favicon_update=' + timestamp;
        }, 500);
      }
    }
  }, [settings]);

  return null;
}