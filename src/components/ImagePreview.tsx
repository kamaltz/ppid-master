"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function ImagePreview({ src, alt, className, width = 100, height = 100 }: ImagePreviewProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Add cache busting for uploaded images
    if (src && (src.includes('/uploads/') || src.includes('/api/uploads/'))) {
      const timestamp = Date.now();
      const separator = src.includes('?') ? '&' : '?';
      setImageSrc(`${src}${separator}v=${timestamp}`);
    } else {
      setImageSrc(src);
    }
    setError(false);
  }, [src]);

  const handleError = () => {
    setError(true);
    // Try fallback without cache busting
    if (imageSrc.includes('?v=')) {
      setImageSrc(src);
    }
  };

  if (error) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`} style={{ width, height }}>
        <span className="text-gray-500 text-xs">No Image</span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      unoptimized
    />
  );
}