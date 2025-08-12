"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRoleDisplayName } from "@/lib/roleUtils";
import { User, Mail, Phone, MapPin, Camera, Save, Lock, Key } from "lucide-react";

export default function ProfilePage() {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  
  const getDefaultProfile = () => {
    switch (userRole) {
      case 'Admin':
        return {
          nama: "Admin PPID",
          email: "admin@ppid-garut.go.id",
          telepon: "0262-123456",
          alamat: "Jl. Pembangunan No. 1, Garut",
          foto: "/default-avatar.png",
          nip: "198501012010011001",
          jabatan: "Administrator PPID"
        };
      case 'PPID':
        return {
          nama: "PPID Utama",
          email: "ppid.utama@ppid-garut.go.id",
          telepon: "0262-123457",
          alamat: "Jl. Pembangunan No. 1, Garut",
          foto: "/default-avatar.png",
          nip: "198502022010012002",
          jabatan: "Pejabat Pengelola Informasi dan Dokumentasi Utama"
        };
      case 'PPID_Pelaksana':
        return {
          nama: "PPID Pelaksana",
          email: "ppid.pelaksana@ppid-garut.go.id",
          telepon: "0262-123458",
          alamat: "Jl. Pembangunan No. 1, Garut",
          foto: "/default-avatar.png",
          nip: "198503032010013003",
          jabatan: "Pejabat Pengelola Informasi dan Dokumentasi Pelaksana"
        };
      case 'Atasan_PPID':
        return {
          nama: "Atasan PPID",
          email: "atasan.ppid@ppid-garut.go.id",
          telepon: "0262-123459",
          alamat: "Jl. Pembangunan No. 1, Garut",
          foto: "/default-avatar.png",
          nip: "198504042010014004",
          jabatan: "Atasan Pejabat Pengelola Informasi dan Dokumentasi"
        };
      default:
        return {
          nama: "User PPID",
          email: "user@ppid-garut.go.id",
          telepon: "0262-123456",
          alamat: "Jl. Pembangunan No. 1, Garut",
          foto: "/default-avatar.png",
          nip: "198501012010011001",
          jabatan: "Staff PPID"
        };
    }
  };
  
  const [profileData, setProfileData] = useState(getDefaultProfile());
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(getDefaultProfile());
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = () => {
    setProfileData(tempData);
    setIsEditing(false);
    alert("Profile berhasil diperbarui!");
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };
  
  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak sama!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }
    if (confirm('Yakin ingin mengubah password?')) {
      alert('Password berhasil diubah!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    }
  };
  
  // Update tempData when component mounts
  useState(() => {
    setTempData(profileData);
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempData(prev => ({ ...prev, foto: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="text-sm text-gray-600 mt-1">
            Role: <span className="font-semibold text-blue-600">{getRoleDisplayName(userRole)}</span>
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h3 className="text-lg font-semibold mt-4">
              {isEditing ? tempData.nama : profileData.nama}
            </h3>
            <p className="text-gray-600">{getRoleDisplayName(userRole)}</p>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nama Lengkap
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.nama}
                    onChange={(e) => setTempData(prev => ({ ...prev, nama: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.nama}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={tempData.email}
                    onChange={(e) => setTempData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telepon
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={tempData.telepon}
                    onChange={(e) => setTempData(prev => ({ ...prev, telepon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.telepon}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIP</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.nip}
                    onChange={(e) => setTempData(prev => ({ ...prev, nip: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.nip}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.jabatan}
                    onChange={(e) => setTempData(prev => ({ ...prev, jabatan: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.jabatan}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Alamat
              </label>
              {isEditing ? (
                <textarea
                  value={tempData.alamat}
                  onChange={(e) => setTempData(prev => ({ ...prev, alamat: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.alamat}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Keamanan Akun</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">{profileData.email}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Ubah Email
            </button>
          </div>
          
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-600">••••••••</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPasswordForm(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Ubah Password
            </button>
          </div>
        </div>
      </div>
      
      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Ubah Password
              </h3>
              <button 
                onClick={() => setShowPasswordForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ubah Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}