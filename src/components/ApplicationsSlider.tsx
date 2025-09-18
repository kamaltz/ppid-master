"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface Application {
  id: string;
  name: string;
  logo: string;
  url: string;
  description?: string;
}

interface ApplicationsSliderProps {
  applications: Application[];
}

export default function ApplicationsSlider({ applications }: ApplicationsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 768) setVisibleCount(2);
      else if (window.innerWidth < 1024) setVisibleCount(3);
      else setVisibleCount(4);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  if (!applications || applications.length === 0) return null;

  const maxIndex = Math.max(0, applications.length - visibleCount);

  const nextSlide = () => {
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            🚀 Aplikasi Layanan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Akses berbagai aplikasi layanan digital Kabupaten Garut
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
            >
              {applications.map((app) => (
                <div 
                  key={app.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <div 
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 text-center group cursor-pointer relative"
                    onClick={() => window.open(app.url, '_blank')}
                  >
                    <div className="mb-4">
                      <div className="w-20 h-20 mx-auto bg-white rounded-lg flex items-center justify-center p-1 shadow-sm group-hover:shadow-md transition-all duration-200">
                        <img
                          src={app.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=3b82f6&color=fff&size=64`}
                          alt={app.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.log('Image failed, using fallback for:', app.logo);
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=3b82f6&color=fff&size=64`;
                          }}
                          onLoad={() => console.log('Image loaded successfully:', app.logo || 'fallback')}
                        />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {app.name}
                    </h3>
                    {app.description && (
                      <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors duration-200">
                        {app.description}
                      </p>
                    )}
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="text-blue-600 font-medium text-xs flex items-center justify-center">
                        <span>Klik untuk akses</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {applications.length > visibleCount && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {applications.length > visibleCount && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentIndex === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}