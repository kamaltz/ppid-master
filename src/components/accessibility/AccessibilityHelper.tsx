"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, Settings, ChevronUp, ChevronDown } from "lucide-react";

export default function AccessibilityHelper() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(0.9);
  const [delay, setDelay] = useState(500);
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenText = useRef<string>('');
  const lastSpokenTime = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('accessibility_enabled');
    const savedSpeed = localStorage.getItem('accessibility_speed');
    const savedDelay = localStorage.getItem('accessibility_delay');
    
    if (saved !== null) setIsEnabled(JSON.parse(saved));
    if (savedSpeed) setSpeed(parseFloat(savedSpeed));
    if (savedDelay) setDelay(parseInt(savedDelay));
    
    // Load voices
    const loadVoices = () => window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  const toggleAccessibility = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('accessibility_enabled', JSON.stringify(newState));
    
    if (!newState) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = useCallback((text: string) => {
    if (!isEnabled || !text || text.length < 2) return;
    
    const now = Date.now();
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    // Prevent duplicate speech within 1 second
    if (cleanText === lastSpokenText.current && now - lastSpokenTime.current < 1000) {
      return;
    }
    
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(voice => 
      voice.lang.includes('id') || voice.name.toLowerCase().includes('indonesia')
    );
    
    if (indonesianVoice) utterance.voice = indonesianVoice;
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    lastSpokenText.current = cleanText;
    lastSpokenTime.current = now;
  }, [isEnabled, speed]);

  const getTextToSpeak = useCallback((target: HTMLElement): string => {
    // Skip if target is the accessibility helper itself
    if (target && target.closest && target.closest('[data-accessibility-helper]')) return '';
    
    const tagName = target.tagName.toLowerCase();
    
    // Priority order for text extraction
    const ariaLabel = target.getAttribute('aria-label');
    const title = target.getAttribute('title');
    const textContent = target.textContent?.trim();
    
    switch (tagName) {
      case 'button':
        return ariaLabel || textContent || 'Tombol';
      case 'a':
        return ariaLabel || textContent || 'Tautan';
      case 'input':
      case 'textarea':
        const input = target as HTMLInputElement;
        const label = document.querySelector(`label[for="${input.id}"]`)?.textContent;
        return ariaLabel || label || input.placeholder || 'Kolom input';
      case 'select':
        return ariaLabel || 'Pilihan dropdown';
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return textContent ? `Judul: ${textContent}` : '';
      case 'img':
        const img = target as HTMLImageElement;
        return img.alt || 'Gambar';
      default:
        // Only speak short, meaningful text
        if (textContent && textContent.length > 2 && textContent.length < 150) {
          return textContent;
        }
        return title || '';
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      return;
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !target.tagName) return;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      const textToSpeak = getTextToSpeak(target);
      if (textToSpeak) {
        debounceTimer.current = setTimeout(() => {
          speakText(textToSpeak);
        }, delay);
      }
    };

    const handleMouseLeave = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [isEnabled, speakText, getTextToSpeak, delay]);

  const updateSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    localStorage.setItem('accessibility_speed', newSpeed.toString());
  };

  const updateDelay = (newDelay: number) => {
    setDelay(newDelay);
    localStorage.setItem('accessibility_delay', newDelay.toString());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" data-accessibility-helper>
      {!isExpanded ? (
        // Floating icon when collapsed
        <button
          onClick={() => setIsExpanded(true)}
          className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 flex items-center justify-center ${
            isEnabled 
              ? 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700' 
              : 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300'
          }`}
          aria-label="Tampilkan kontrol aksesibilitas"
        >
          {isEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          {isSpeaking && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />}
        </button>
      ) : (
        // Full accessibility helper when expanded
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 p-3">
            <button
              onClick={toggleAccessibility}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                isEnabled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              aria-label={isEnabled ? 'Nonaktifkan bantuan suara' : 'Aktifkan bantuan suara'}
            >
              {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {isEnabled ? 'Aktif' : 'Nonaktif'}
              {isSpeaking && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
            </button>
            
            {isEnabled && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                aria-label="Pengaturan aksesibilitas"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Sembunyikan kontrol aksesibilitas"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          {isEnabled && (
            <div className="px-3 pb-2">
              <p className="text-xs text-gray-500">
                Arahkan kursor untuk mendengar teks
              </p>
            </div>
          )}
          
          {isEnabled && showSettings && (
            <div className="border-t border-gray-200 p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Kecepatan: {speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => updateSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Delay: {delay}ms
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="100"
                  value={delay}
                  onChange={(e) => updateDelay(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}