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

  // Redirect PPID to specialized dashboard
  if (userRole === 'PPID_UTAMA') {
    window.location.href = '/admin/ppid-dashboard';
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
  }

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📊 Dashboard {getRoleDisplayName(userRole)}
            </h1>
            <div className="text-xs md:text-sm text-gray-500 mt-1 space-y-1 md:space-y-0">
              <div>
                Login sebagai: <span className="font-semibold text-blue-600">
                  {getRoleDisplayName(userRole)}
                </span>
              </div>
              <div className="flex items-center">
                Update terakhir: {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID') : 'Tidak tersedia'}
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              <span className="hidden sm:inline">{getRoleDisplayName(userRole)}</span>
              <span className="sm:hidden">{userRole}</span>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 md:ml-4 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 text-truncate">Total Permohonan</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600 flex-shrink-0" />
              <div className="ml-2 md:ml-4 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 text-truncate">Diajukan</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.diajukan}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 md:ml-4 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 text-truncate">Diproses</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.diproses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
              <div className="ml-2 md:ml-4 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 text-truncate">Selesai</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.selesai}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md col-span-2 md:col-span-1">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600 flex-shrink-0" />
              <div className="ml-2 md:ml-4 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 text-truncate">Ditolak</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.ditolak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-1 rounded-xl">
            <Chart
              type="pie"
              title="📊 Status Permohonan"
              data={chartData.status}
              height={300}
            />
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-1 rounded-xl">
            <Chart
              type="line"
              title="📈 Tren Harian (7 Hari)"
              data={chartData.daily}
              height={300}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-1 rounded-xl">
            <Chart
              type="bar"
              title="📅 Per Bulan"
              data={chartData.monthly}
              height={280}
            />
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-1 rounded-xl">
            <Chart
              type="donut"
              title="🏷️ Kategori"
              data={chartData.category}
              height={280}
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">10 Permohonan Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pemohon
                  </th>
                  <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="hidden md:inline">Jenis Informasi</span>
                    <span className="md:hidden">Info</span>
                  </th>
                  <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permintaan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-lg font-medium">Belum ada data permohonan</p>
                        <p className="text-sm">Data akan muncul setelah ada permohonan baru atau gunakan tombol "Generate Test Data"</p>
                      </div>
                    </td>
                  </tr>
                ) : permintaan.slice(0, 10).map((request) => {
                  // Simple date display
                  let dateDisplay = 'Tanggal tidak tersedia';
                  let timeDisplay = '-';
                  
                  try {
                    const date = new Date(request.created_at);
                    if (!isNaN(date.getTime())) {
                      dateDisplay = date.toLocaleDateString('id-ID');
                      timeDisplay = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    }
                  } catch (e) {
                    // Keep default values
                  }
                  
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
                        <div className="flex flex-col">
                          <span className="font-medium">{dateDisplay}</span>
                          <span className="text-xs text-gray-400">{timeDisplay}</span>
                        </div>
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
