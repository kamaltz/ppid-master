"use client";

import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function DynamicLayout() {
  const { settings } = useSettings();

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
    }
  }, [settings]);

  return null;
}