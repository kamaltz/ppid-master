"use client";

import { useAuth } from "@/context/AuthContext";
import { getRoleDisplayName } from "@/lib/roleUtils";
import { FileText, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Chart from "@/components/ui/Chart";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const { permintaan, stats, chartData, isLoading, lastUpdate, refreshData } = useDashboardData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diajukan": return "text-yellow-600 bg-yellow-100";
      case "Diproses": return "text-blue-600 bg-blue-100";
      case "Selesai": return "text-green-600 bg-green-100";
      case "Ditolak": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    return status;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📊 Dashboard {getRoleDisplayName(userRole)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Login sebagai: <span className="font-semibold text-blue-600">
                {getRoleDisplayName(userRole)}
              </span> | 
              Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {getRoleDisplayName(userRole)}
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Permohonan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Diajukan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.diajukan}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Diproses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.diproses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{stats.selesai}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ditolak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-1 rounded-xl">
            <Chart
              type="pie"
              title="📊 Status Permohonan"
              data={chartData.status}
              height={350}
            />
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-1 rounded-xl">
            <Chart
              type="line"
              title="📈 Tren Permohonan Harian (7 Hari Terakhir)"
              data={chartData.daily}
              height={350}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-1 rounded-xl">
            <Chart
              type="bar"
              title="📅 Permohonan per Bulan"
              data={chartData.monthly}
              height={300}
            />
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-1 rounded-xl">
            <Chart
              type="donut"
              title="🏷️ Kategori Informasi"
              data={chartData.category}
              height={300}
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">10 Permohonan Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pemohon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Informasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permintaan.slice(0, 10).map((request) => {
                  const isValidDate = request.created_at && !isNaN(new Date(request.created_at).getTime());
                  return (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {request.pemohon?.nama || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.pemohon?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.pemohon?.nik || request.pemohon?.no_telepon || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={request.rincian_informasi}>
                          {request.rincian_informasi?.substring(0, 40)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.file_attachments ? (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {Array.isArray(request.file_attachments) ? request.file_attachments.length : 1} file
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isValidDate ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {new Date(request.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(request.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Tanggal tidak valid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
