"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Calendar, User, Activity, Download, Filter, Trash2 } from "lucide-react";

interface ActivityLog {
  id: number;
  action: string;
  level: string;
  message: string;
  details: string | object | null;
  user_id: string;
  user_role: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  resource_id: string;
  resource_type: string;
  created_at: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [blacklistedIPs, setBlacklistedIPs] = useState<string[]>([]);
  const [isManagingBlacklist, setIsManagingBlacklist] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [securityStats, setSecurityStats] = useState<{
    rateLimiting: { activeIPs: number; details: Array<{ ip: string; requests: number }> };
    ddosProtection: { suspiciousIPs: number; details: Array<{ ip: string; recentRequests: number }> };
    ipBlacklist: { totalBlacklisted: number; blacklistedIPs: string[] };
  } | null>(null);
  const { token, getUserRole } = useAuth();
  const userRole = getUserRole();

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/activity-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        throw new Error(data.error || 'API request failed');
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchBlacklist = useCallback(async () => {
    try {
      const response = await fetch('/api/logs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'getBlacklist' })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.blacklist) {
          setBlacklistedIPs(data.blacklist);
        }
      }
    } catch (error) {
      console.error('Failed to fetch blacklist:', error);
    }
  }, [token]);

  const unblockIP = useCallback(async (ip: string) => {
    if (!confirm(`Hapus ${ip} dari blacklist?`)) return;
    
    setIsManagingBlacklist(true);
    try {
      const response = await fetch('/api/logs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'unblockIP', ip })
      });
      
      if (response.ok) {
        fetchBlacklist();
        alert(`IP ${ip} berhasil dihapus dari blacklist`);
      } else {
        alert('Gagal menghapus IP dari blacklist');
      }
    } catch (error) {
      console.error('Failed to unblock IP:', error);
      alert('Gagal menghapus IP dari blacklist');
    } finally {
      setIsManagingBlacklist(false);
    }
  }, [token, fetchBlacklist]);

  const clearBlacklist = useCallback(async () => {
    if (!confirm('Hapus semua IP dari blacklist?')) return;
    
    setIsManagingBlacklist(true);
    try {
      const response = await fetch('/api/logs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'clearBlacklist' })
      });
      
      if (response.ok) {
        fetchBlacklist();
        alert('Semua IP berhasil dihapus dari blacklist');
      } else {
        alert('Gagal menghapus blacklist');
      }
    } catch (error) {
      console.error('Failed to clear blacklist:', error);
      alert('Gagal menghapus blacklist');
    } finally {
      setIsManagingBlacklist(false);
    }
  }, [token, fetchBlacklist]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = (userRole === 'ADMIN' || userRole === 'PPID_UTAMA') 
        ? (roleFilter === "all" || log.user_role === roleFilter)
        : true;
      
      const matchesLevel = levelFilter === "all" || log.level === levelFilter;
      
      const matchesDate = (!startDate || new Date(log.created_at) >= new Date(startDate)) &&
                          (!endDate || new Date(log.created_at) <= new Date(endDate));
      
      return matchesSearch && matchesRole && matchesLevel && matchesDate;
    });
  }, [logs, searchTerm, roleFilter, levelFilter, userRole, startDate, endDate]);

  const exportLogs = useCallback(async () => {
    setIsExporting(true);
    try {
      const logsToExport = filteredLogs.map(log => {
        const details = typeof log.details === 'object' ? JSON.stringify(log.details) : log.details;
        return `[${new Date(log.created_at).toLocaleString('id-ID')}] ${log.action}\n` +
               `User: ${log.user_email || 'Unknown'} (${log.user_role}) - ID: ${log.user_id}\n` +
               `Message: ${log.message}\n` +
               `IP: ${log.ip_address} | User Agent: ${log.user_agent || 'Unknown'}\n` +
               `Resource: ${log.resource_type || 'N/A'} (ID: ${log.resource_id || 'N/A'})\n` +
               `Details: ${details || 'None'}\n` +
               `${'='.repeat(80)}\n`;
      }).join('\n');
      
      const header = `PPID GARUT - LOG AKTIVITAS SISTEM\n` +
                    `Exported: ${new Date().toLocaleString('id-ID')}\n` +
                    `Total Records: ${filteredLogs.length}\n` +
                    `${'='.repeat(80)}\n\n`;
      
      const content = header + logsToExport;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ppid-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor log');
    } finally {
      setIsExporting(false);
    }
  }, [filteredLogs]);

  const deleteLogs = useCallback(async () => {
    if (selectedLogs.length === 0) return;
    
    if (!confirm(`Hapus ${selectedLogs.length} log yang dipilih?`)) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/logs/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedLogs })
      });
      
      if (response.ok) {
        setSelectedLogs([]);
        fetchLogs();
        alert('Log berhasil dihapus');
      } else {
        alert('Gagal menghapus log');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Gagal menghapus log');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedLogs, token, fetchLogs]);

  const toggleSelectAll = useCallback(() => {
    if (selectedLogs.length === filteredLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(filteredLogs.map(log => log.id));
    }
  }, [selectedLogs.length, filteredLogs]);

  const toggleSelectLog = useCallback((logId: number) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  }, []);

  const getLevelColor = useCallback((level: string) => {
    const colors = {
      'INFO': 'bg-blue-100 text-blue-800',
      'SUCCESS': 'bg-green-100 text-green-800',
      'WARN': 'bg-yellow-100 text-yellow-800',
      'ERROR': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }, []);

  const getActionColor = useCallback((action: string) => {
    const colors = {
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'LOGIN_FAILED': 'bg-red-100 text-red-800',
      'CREATE_ACCOUNT': 'bg-blue-100 text-blue-800',
      'DELETE_ACCOUNT': 'bg-red-100 text-red-800',
      'UPDATE_PERMISSIONS': 'bg-orange-100 text-orange-800',
      'CREATE_PERMOHONAN': 'bg-purple-100 text-purple-800',
      'UPDATE_PERMOHONAN': 'bg-yellow-100 text-yellow-800',
      'CREATE_KEBERATAN': 'bg-pink-100 text-pink-800',
      'UPDATE_SETTINGS': 'bg-indigo-100 text-indigo-800'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Log Aktivitas</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total: {filteredLogs.length} aktivitas
            {selectedLogs.length > 0 && ` | ${selectedLogs.length} dipilih`}
          </div>
          {selectedLogs.length > 0 && (
            <button
              onClick={deleteLogs}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Menghapus...' : `Hapus ${selectedLogs.length} Log`}
            </button>
          )}
          <button
            onClick={exportLogs}
            disabled={isExporting || filteredLogs.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Mengekspor...' : 'Export TXT'}
          </button>
          <button
            onClick={() => {
              setShowBlacklist(!showBlacklist);
              if (!showBlacklist) fetchBlacklist();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Filter className="w-4 h-4" />
            IP Blacklist
          </button>
          <button
            onClick={async () => {
              setShowSecurity(!showSecurity);
              if (!showSecurity) {
                try {
                  const response = await fetch('/api/security/status', {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (response.ok) {
                    const data = await response.json();
                    setSecurityStats(data.data);
                  }
                } catch (error) {
                  console.error('Failed to fetch security stats:', error);
                }
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Activity className="w-4 h-4" />
            Security Monitor
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Log</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari aktivitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {(userRole === 'ADMIN' || userRole === 'PPID_UTAMA') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Role</option>
                <option value="ADMIN">Admin</option>
                <option value="PPID_UTAMA">PPID Utama</option>
                <option value="PPID_PELAKSANA">PPID Pelaksana</option>
                <option value="ATASAN_PPID">Atasan PPID</option>
                <option value="PEMOHON">Pemohon</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Level</option>
              <option value="INFO">Info</option>
              <option value="SUCCESS">Success</option>
              <option value="WARN">Warning</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Security Monitor */}
      {showSecurity && securityStats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Monitor</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rate Limiting */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Rate Limiting</h4>
              <p className="text-2xl font-bold text-blue-600">{securityStats.rateLimiting.activeIPs}</p>
              <p className="text-sm text-blue-700">Active IPs being rate limited</p>
              {securityStats.rateLimiting.details.length > 0 && (
                <div className="mt-2 space-y-1">
                  {securityStats.rateLimiting.details.slice(0, 3).map((item, i: number) => (
                    <div key={i} className="text-xs text-blue-600">
                      {item.ip}: {item.requests} requests
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* DDoS Protection */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 mb-2">DDoS Protection</h4>
              <p className="text-2xl font-bold text-orange-600">{securityStats.ddosProtection.suspiciousIPs}</p>
              <p className="text-sm text-orange-700">Suspicious IPs detected</p>
              {securityStats.ddosProtection.details.length > 0 && (
                <div className="mt-2 space-y-1">
                  {securityStats.ddosProtection.details.slice(0, 3).map((item, i: number) => (
                    <div key={i} className="text-xs text-orange-600">
                      {item.ip}: {item.recentRequests} req/10s
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* IP Blacklist */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">IP Blacklist</h4>
              <p className="text-2xl font-bold text-red-600">{securityStats.ipBlacklist.totalBlacklisted}</p>
              <p className="text-sm text-red-700">Blocked IP addresses</p>
              {securityStats.ipBlacklist.blacklistedIPs.length > 0 && (
                <div className="mt-2 space-y-1">
                  {securityStats.ipBlacklist.blacklistedIPs.slice(0, 3).map((ip: string, i: number) => (
                    <div key={i} className="text-xs text-red-600 font-mono">
                      {ip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Security Headers Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="text-green-700">✓ XSS Protection: Enabled</div>
              <div className="text-green-700">✓ Content-Type: nosniff</div>
              <div className="text-green-700">✓ Frame Options: SAMEORIGIN</div>
            </div>
          </div>
        </div>
      )}

      {/* IP Blacklist Management */}
      {showBlacklist && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">IP Blacklist Management</h3>
            <div className="flex gap-2">
              <button
                onClick={clearBlacklist}
                disabled={isManagingBlacklist || blacklistedIPs.length === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
              >
                {isManagingBlacklist ? 'Processing...' : 'Clear All'}
              </button>
              <button
                onClick={fetchBlacklist}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {blacklistedIPs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Tidak ada IP yang diblacklist</p>
              <p className="text-sm mt-1">IP akan otomatis diblacklist setelah 5 percobaan login gagal dalam 15 menit</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Total {blacklistedIPs.length} IP diblacklist. IP diblokir otomatis setelah 5 percobaan login gagal dalam 15 menit.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {blacklistedIPs.map((ip) => (
                  <div key={ip} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-mono text-sm">{ip}</span>
                    </div>
                    <button
                      onClick={() => unblockIP(ip)}
                      disabled={isManagingBlacklist}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat log aktivitas...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Tidak ada log aktivitas</p>
            <p className="text-gray-400 text-sm mt-1">Log akan muncul setelah ada aktivitas sistem</p>
          </div>
        ) : (
          <div>
            <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                onChange={toggleSelectAll}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Pilih Semua ({filteredLogs.length} log)
              </span>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedLogs.includes(log.id)}
                      onChange={() => toggleSelectLog(log.id)}
                      className="rounded mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        {log.level && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                            {log.level}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-gray-600">
                          oleh {log.user_role}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 mb-2 font-medium">{log.message}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user_email || `ID: ${log.user_id}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="font-mono">IP: {log.ip_address || '127.0.0.1'}</span>
                        </div>
                        <div>
                          Resource: {log.resource_type || 'N/A'} {log.resource_id ? `(${log.resource_id})` : ''}
                        </div>
                      </div>
                      
                      {log.details && (
                        <details className="text-xs text-gray-600">
                          <summary className="cursor-pointer hover:text-gray-800">Detail Tambahan</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}