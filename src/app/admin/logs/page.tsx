"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Calendar, User, Activity } from "lucide-react";

interface ActivityLog {
  id: number;
  action: string;
  details: string;
  user_id: string;
  user_role: string;
  ip_address: string;
  created_at: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/admin/activity-logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
        setFilteredLogs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  useEffect(() => {
    let filtered = logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || log.user_role === roleFilter;
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      
      return matchesSearch && matchesRole && matchesAction;
    });
    
    setFilteredLogs(filtered);
  }, [logs, searchTerm, roleFilter, actionFilter]);

  const getActionColor = (action: string) => {
    const colors = {
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'CREATE_REQUEST': 'bg-blue-100 text-blue-800',
      'UPDATE_STATUS': 'bg-yellow-100 text-yellow-800',
      'DELETE_REQUEST': 'bg-red-100 text-red-800',
      'CREATE_KEBERATAN': 'bg-purple-100 text-purple-800',
      'UPDATE_PERMISSIONS': 'bg-orange-100 text-orange-800',
      'DELETE_MEDIA': 'bg-red-100 text-red-800'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Log Aktivitas</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredLogs.length} aktivitas
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari aktivitas, detail, atau role..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
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
              <option value="Pemohon">Pemohon</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Aktivitas</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">Semua Aktivitas</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE_REQUEST">Buat Permohonan</option>
              <option value="UPDATE_STATUS">Update Status</option>
              <option value="CREATE_KEBERATAN">Buat Keberatan</option>
              <option value="DELETE_MEDIA">Hapus Media</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat log aktivitas...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Tidak ada log aktivitas ditemukan</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-600">
                        oleh {log.user_role}
                      </span>
                    </div>
                    
                    <p className="text-gray-800 mb-2">{log.details}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        ID: {log.user_id}
                      </div>
                      <div>
                        IP: {log.ip_address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}