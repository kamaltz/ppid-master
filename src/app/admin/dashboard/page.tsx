"use client";

import { useAuth } from "@/context/AuthContext";
import { getRoleDisplayName } from "@/lib/roleUtils";
import { FileText, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Chart from "@/components/ui/Chart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";


export default function DashboardPage() {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const { permintaan, stats, chartData, isLoading, lastUpdate, refreshData } = useDashboardData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Generate year options (current year and 4 years back)
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4 md:p-6 pb-20 sm:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-3 sm:space-y-4 md:flex-row md:justify-between md:items-center mb-4 sm:mb-6 md:mb-8 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              📊 Dashboard
              <span className="hidden sm:inline"> {getRoleDisplayName(userRole)}</span>
            </h1>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1">
                <span>Login:</span>
                <span className="font-semibold text-blue-600 text-xs sm:text-sm">
                  {getRoleDisplayName(userRole)}
                </span>
              </div>
              <div className="flex items-center text-xs">
                <span className="truncate">Update: {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse flex-shrink-0"></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
              <span className="hidden sm:inline">{getRoleDisplayName(userRole)}</span>
              <span className="sm:hidden">{userRole.split('_')[0]}</span>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-yellow-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Diajukan</p>
                <p className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900">{stats.diajukan}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Diproses</p>
                <p className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900">{stats.diproses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Selesai</p>
                <p className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900">{stats.selesai}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md col-span-2 sm:col-span-1">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Ditolak</p>
                <p className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900">{stats.ditolak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-1 rounded-xl">
            <Chart
              type="pie"
              title="📊 Status Permohonan"
              data={chartData.status}
              height={250}
            />
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-1 rounded-xl">
            <Chart
              type="line"
              title="📈 Tren Harian (7 Hari)"
              data={chartData.daily}
              height={250}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-1 rounded-xl">
            <Chart
              type="bar"
              title="📅 Per Bulan"
              data={chartData.monthly}
              height={250}
            />
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-pink-100 p-1 rounded-xl">
            <Chart
              type="line"
              title="⚖️ Permohonan Ditolak (7 Hari)"
              data={chartData.keberatan}
              height={250}
            />
          </div>
        </div>
        
        {/* Yearly Progress Chart - Full Width */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              📈 Progress Tahunan
            </h3>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-1 rounded-xl">
            <Chart
              type="line"
              title={`📊 Permohonan & Keberatan ${selectedYear}`}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [
                  {
                    label: 'Permohonan',
                    data: chartData.yearlyPermohonan?.[selectedYear] || Array(12).fill(0),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: false
                  },
                  {
                    label: 'Keberatan (Ditolak)',
                    data: chartData.yearlyKeberatan?.[selectedYear] || Array(12).fill(0),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: false
                  }
                ]
              }}
              height={300}
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">10 Permohonan Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pemohon
                  </th>
                  <th className="hidden sm:table-cell px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="hidden md:inline">Jenis Informasi</span>
                    <span className="md:hidden">Info</span>
                  </th>
                  <th className="hidden md:table-cell px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="hidden sm:inline">Tanggal</span>
                    <span className="sm:hidden">Tgl</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permintaan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mb-2" />
                        <p className="text-sm sm:text-lg font-medium">Belum ada data permohonan</p>
                        <p className="text-xs sm:text-sm px-4">Data akan muncul setelah ada permohonan baru</p>
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
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4">
                        <div className="flex flex-col min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {request.pemohon?.nama || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {request.pemohon?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                        <div className="truncate">
                          {request.pemohon?.nik || request.pemohon?.no_telepon || 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                        <div className="truncate max-w-[120px] sm:max-w-xs" title={request.rincian_informasi}>
                          {request.rincian_informasi?.substring(0, 30)}...
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                        {request.file_attachments ? (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 sm:px-2 py-1 rounded">
                              {Array.isArray(request.file_attachments) ? request.file_attachments.length : 1}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4">
                        <span className={`inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          <span className="hidden sm:inline">{getStatusLabel(request.status)}</span>
                          <span className="sm:hidden">{request.status.substring(0, 3)}</span>
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-4 text-xs text-gray-500">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{dateDisplay}</span>
                          <span className="text-xs text-gray-400 hidden sm:inline">{timeDisplay}</span>
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
