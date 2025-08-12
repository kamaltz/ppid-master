"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function AccessibilityHelper() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('accessibility_enabled');
    if (saved !== null) {
      setIsEnabled(JSON.parse(saved));
    }
    
    // Load voices when component mounts
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  const toggleAccessibility = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('accessibility_enabled', JSON.stringify(newState));
  };

  const speakText = (text: string) => {
    if (!isEnabled || !text) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find Indonesian voice
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(voice => 
      voice.lang.includes('id') || 
      voice.name.toLowerCase().includes('indonesia') ||
      voice.name.toLowerCase().includes('bahasa')
    );
    
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }
    
    utterance.lang = 'id-ID';
    utterance.rate = 0.7;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      let textToSpeak = '';

      if (target.tagName === 'BUTTON') {
        textToSpeak = target.textContent || target.getAttribute('aria-label') || 'Tombol';
      } else if (target.tagName === 'A') {
        textToSpeak = target.textContent || target.getAttribute('aria-label') || 'Link';
      } else if (target.tagName === 'INPUT') {
        const input = target as HTMLInputElement;
        const label = document.querySelector(`label[for="${input.id}"]`)?.textContent;
        textToSpeak = label || input.placeholder || input.getAttribute('aria-label') || 'Input field';
      } else if (target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3') {
        textToSpeak = target.textContent || '';
      } else if (target.textContent && target.textContent.trim().length > 0 && target.textContent.length < 100) {
        textToSpeak = target.textContent.trim();
      }

      if (textToSpeak) {
        speakText(textToSpeak);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, [isEnabled]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAccessibility}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
              isEnabled 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            aria-label={isEnabled ? 'Nonaktifkan bantuan suara' : 'Aktifkan bantuan suara'}
          >
            {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {isEnabled ? 'Suara Aktif' : 'Suara Nonaktif'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            aria-label="Sembunyikan kontrol aksesibilitas"
          >
            ✕
          </button>
        </div>
        {isEnabled && (
          <p className="text-xs text-gray-500 mt-2">
            Arahkan kursor ke elemen untuk mendengar teks
          </p>
        )}
      </div>
    </div>
  );
}