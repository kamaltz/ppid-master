"use client";

import { useState } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminPengaturanPage() {
  const [settings, setSettings] = useState({
    namaInstansi: 'PPID Diskominfo Kabupaten Garut',
    email: 'ppid@garutkab.go.id',
    telepon: '(0262) 123456',
    alamat: 'Jl. Pembangunan No. 1, Garut, Jawa Barat'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      alert('Pengaturan berhasil disimpan!');
      setIsSaving(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Pengaturan</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6">Pengaturan Sistem</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Instansi</label>
            <input 
              type="text" 
              value={settings.namaInstansi}
              onChange={(e) => handleChange('namaInstansi', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800" 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Kontak</label>
            <input 
              type="email" 
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800" 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
            <input 
              type="tel" 
              value={settings.telepon}
              onChange={(e) => handleChange('telepon', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800" 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea 
              rows={3}
              value={settings.alamat}
              onChange={(e) => handleChange('alamat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              required
            ></textarea>
          </div>
          
          <RoleGuard requiredRoles={[ROLES.ADMIN]} showAccessDenied={false}>
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-blue-800 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-6 rounded-lg"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </RoleGuard>
        </form>
      </div>
    </div>
  );
}