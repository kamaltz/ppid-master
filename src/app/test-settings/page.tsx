"use client";

import { useState, useEffect } from 'react';
import CustomHeader from '@/components/layout/CustomHeader';
import CustomFooter from '@/components/layout/CustomFooter';
import CustomHero from '@/components/layout/CustomHero';

export default function TestSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [debugData, setDebugData] = useState(null);

  useEffect(() => {
    loadSettings();
    loadDebugData();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`);
      const result = await response.json();
      setSettings(result);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadDebugData = async () => {
    try {
      const response = await fetch(`/api/settings/debug?t=${Date.now()}`);
      const result = await response.json();
      setDebugData(result);
    } catch (error) {
      console.error('Error loading debug data:', error);
    }
  };

  return (
    <div>
      <CustomHeader />
      <CustomHero />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Test Settings</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Current Settings</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Database Debug</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="mt-8">
          <button 
            onClick={() => { loadSettings(); loadDebugData(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      <CustomFooter />
    </div>
  );
}