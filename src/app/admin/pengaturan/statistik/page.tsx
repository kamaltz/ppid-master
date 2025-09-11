"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Save, BarChart3, Settings } from "lucide-react";

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
  const { getToken } = useAuth();
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

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = getToken();
        const response = await fetch('/api/settings/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.config) {
          setConfig(data.config);
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [getToken]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch('/api/settings/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      if (data.success) {
        alert('Pengaturan statistik berhasil disimpan!');
      } else {
        alert('Gagal menyimpan: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Terjadi kesalahan saat menyimpan');
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Mode Statistik
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
              <Settings className="w-5 h-5 mr-2" />
              Nilai Manual
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
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  );
}