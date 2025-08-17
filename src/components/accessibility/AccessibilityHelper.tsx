"use client";

import { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function AccessibilityHelper() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

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

  const speakText = useCallback(async (text: string) => {
    if (!isEnabled || !text) return;
    
    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    
    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          voice_id: 'pNInz6obpgDQGcFmaJgB',
          model_id: 'eleven_multilingual_v2'
        })
      });
      
      if (!response.ok) {
        throw new Error('ElevenLabs API failed');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setCurrentAudio(audio);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };
      
      await audio.play();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
    }
  }, [isEnabled, currentAudio]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Clear previous timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

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
        // Add 800ms delay before speaking
        const timer = setTimeout(() => {
          speakText(textToSpeak);
        }, 800);
        setDebounceTimer(timer);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [isEnabled, speakText, debounceTimer]);

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