"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Calendar, User, Activity, Download, Filter, Trash2 } from "lucide-react";

interface ActivityLog {
  id: number;
  action: string;
  level: string;
  message: string;
  details: any;
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
  const [actionFilter, setActionFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { token } = useAuth();

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`/api/logs?${params.toString()}`, {
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
      alert('Gagal memuat log aktivitas. Silakan coba lagi.');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, levelFilter, actionFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
    // Auto refresh every 30 seconds for real-time updates
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
      
      const matchesRole = roleFilter === "all" || log.user_role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [logs, searchTerm, roleFilter]);

  const exportLogs = useCallback(async () => {
    setIsExporting(true);
    try {
      const logsToExport = filteredLogs.map(log => {
        const details = typeof log.details === 'object' ? JSON.stringify(log.details) : log.details;
        return `[${new Date(log.created_at).toLocaleString('id-ID')}] ${log.level} - ${log.action}\n` +
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
                    `Filter Applied: Role=${roleFilter}, Level=${levelFilter}, Action=${actionFilter}\n` +
                    `Date Range: ${startDate || 'All'} to ${endDate || 'All'}\n` +
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
  }, [filteredLogs, roleFilter, levelFilter, actionFilter, startDate, endDate]);

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
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Log</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari aktivitas, pesan, email..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">Semua Level</option>
              <option value="INFO">Info</option>
              <option value="SUCCESS">Success</option>
              <option value="WARN">Warning</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="PPID_UTAMA">PPID Utama</option>
              <option value="PPID_PELAKSANA">PPID Pelaksana</option>
              <option value="ATASAN_PPID">Atasan PPID</option>
              <option value="PEMOHON">Pemohon</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
        
        <div className="mt-4 flex gap-2 items-center">
          <button
            onClick={fetchLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Terapkan Filter
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setLevelFilter('all');
              setRoleFilter('all');
              setActionFilter('all');
              setStartDate('');
              setEndDate('');
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Reset Filter
          </button>
          <div className="text-xs text-gray-500 ml-4">
            🔄 Auto refresh setiap 30 detik
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat log aktivitas...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Tidak ada log aktivitas ditemukan</div>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
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
                        <div>
                          IP: {log.ip_address}
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