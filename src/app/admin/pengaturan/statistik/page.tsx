"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

// Fallback icons if lucide-react is not available
const SaveIcon = () => <span>💾</span>;
const BarChartIcon = () => <span>📊</span>;
const SettingsIcon = () => <span>⚙️</span>;

interface StatsConfig {
  mode: 'manual' | 'auto';
  manual: {
    permintaanSelesai: number;
    rataRataHari: number;
    totalInformasi: number;
    aksesOnline: string;
  };
}

export default function StatistikSettingsPage() {
  const auth = useAuth();
  const getToken = auth?.getToken || (() => null);
  const [config, setConfig] = useState<StatsConfig>({
    mode: 'manual',
    manual: {
      permintaanSelesai: 150,
      rataRataHari: 7,
      totalInformasi: 85,
      aksesOnline: '24/7'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Token tidak tersedia. Silakan login ulang.');
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/settings/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success && data.config) {
          setConfig(data.config);
          setError(null);
        } else {
          setError(data.error || 'Gagal memuat konfigurasi');
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Token tidak tersedia. Silakan login ulang.');
        return;
      }
      
      const response = await fetch('/api/settings/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        alert('Pengaturan statistik berhasil disimpan!');
      } else {
        setError(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Pengaturan Statistik Homepage
        </h1>
        <p className="text-gray-600">
          Kelola tampilan statistik di halaman utama website
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              ⚠️ <strong>Error:</strong> {error}
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChartIcon /> Mode Statistik
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="manual"
                checked={config.mode === 'manual'}
                onChange={(e) => setConfig(prev => ({ ...prev, mode: e.target.value as 'manual' | 'auto' }))}
                className="mr-3"
              />
              <div>
                <span className="font-medium">Manual</span>
                <p className="text-sm text-gray-600">Atur nilai statistik secara manual</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="auto"
                checked={config.mode === 'auto'}
                onChange={(e) => setConfig(prev => ({ ...prev, mode: e.target.value as 'manual' | 'auto' }))}
                className="mr-3"
              />
              <div>
                <span className="font-medium">Otomatis</span>
                <p className="text-sm text-gray-600">Ambil data statistik dari database secara otomatis</p>
              </div>
            </label>
          </div>
        </div>

        {config.mode === 'manual' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <SettingsIcon /> Nilai Manual
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permohonan Selesai
                </label>
                <input
                  type="number"
                  value={config.manual.permintaanSelesai}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    manual: { ...prev.manual, permintaanSelesai: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rata-rata Hari Penyelesaian
                </label>
                <input
                  type="number"
                  value={config.manual.rataRataHari}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    manual: { ...prev.manual, rataRataHari: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Informasi Tersedia
                </label>
                <input
                  type="number"
                  value={config.manual.totalInformasi}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    manual: { ...prev.manual, totalInformasi: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Akses Online
                </label>
                <input
                  type="text"
                  value={config.manual.aksesOnline}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    manual: { ...prev.manual, aksesOnline: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="24/7"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  );
}