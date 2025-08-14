"use client";

import { useSettings } from '@/hooks/useSettings';

export default function TestSettingsPage() {
  const { settings, loading } = useSettings();

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Current Settings</h2>
        
        <div className="space-y-4">
          <div>
            <strong>Website Name:</strong> {settings?.general?.namaInstansi || 'Not set'}
          </div>
          <div>
            <strong>Website Title:</strong> {settings?.general?.websiteTitle || 'Not set'}
          </div>
          <div>
            <strong>Website Description:</strong> {settings?.general?.websiteDescription || 'Not set'}
          </div>
          <div>
            <strong>Logo URL:</strong> {settings?.general?.logo || 'Not set'}
          </div>
          {settings?.general?.logo && (
            <div>
              <strong>Logo Preview:</strong>
              <br />
              <img 
                src={settings.general.logo} 
                alt="Logo" 
                className="h-16 w-auto mt-2 border rounded"
              />
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <strong>Raw Settings Data:</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}