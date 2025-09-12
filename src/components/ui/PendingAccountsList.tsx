"use client";

import { useState, useEffect } from "react";
import { Check, X, User, Mail, Phone, MapPin, Briefcase, UserCheck } from "lucide-react";

interface PendingAccount {
  id: number;
  nama: string;
  email: string;
  nik: string;
  no_telepon?: string;
  alamat?: string;
  pekerjaan?: string;
  created_at: string;
}

export default function PendingAccountsList() {
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPendingAccounts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/accounts/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingAccounts(data.success ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching pending accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (accountId: number, approve: boolean) => {
    try {
      setProcessingId(accountId);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_approved: approve })
      });

      if (response.ok) {
        setPendingAccounts(prev => prev.filter(acc => acc.id !== accountId));
      }
    } catch (error) {
      console.error('Error processing approval:', error);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Memuat data...</p>
      </div>
    );
  }

  if (pendingAccounts.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <UserCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Tidak ada pemohon yang menunggu persetujuan</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="divide-y divide-gray-200">
        {pendingAccounts.map((account) => (
          <div key={account.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {account.nama}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Mendaftar: {new Date(account.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{account.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono bg-gray-100 px-1 rounded text-xs">NIK:</span>
                    <span>{account.nik}</span>
                  </div>
                  {account.no_telepon && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{account.no_telepon}</span>
                    </div>
                  )}
                  {account.pekerjaan && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{account.pekerjaan}</span>
                    </div>
                  )}
                  {account.alamat && (
                    <div className="flex items-center space-x-2 sm:col-span-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{account.alamat}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleApproval(account.id, true)}
                  disabled={processingId === account.id}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 text-xs"
                >
                  <Check className="w-3 h-3" />
                  <span>Setujui</span>
                </button>
                <button
                  onClick={() => handleApproval(account.id, false)}
                  disabled={processingId === account.id}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 text-xs"
                >
                  <X className="w-3 h-3" />
                  <span>Tolak</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}