"use client";

import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  AlertTriangle,
  Info,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";
import Chart from "@/components/ui/Chart";

export default function PPIDDashboardPage() {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const { stats, chartData } = useDashboardData();

  const managementSections = userRole === 'PPID_PELAKSANA' ? [
    {
      title: "Permohonan Diproses",
      description: "Kelola permohonan yang sedang diproses",
      icon: FileText,
      href: "/admin/permohonan",
      color: "bg-blue-500",
      stats: `${stats.diproses} Diproses`,
      pending: `${stats.diproses} Aktif`,
    },
    {
      title: "Keberatan Diproses",
      description: "Kelola keberatan yang sedang diproses",
      icon: AlertTriangle,
      href: "/admin/keberatan",
      color: "bg-orange-500",
      stats: "Diproses",
      pending: "Aktif",
    },
    {
      title: "Pengelolaan Informasi",
      description: "Kelola informasi publik",
      icon: Info,
      href: "/admin/informasi",
      color: "bg-green-500",
      stats: "Informasi",
      pending: "Publik",
    },
    {
      title: "Kategori Informasi",
      description: "Kelola kategori informasi",
      icon: FileText,
      href: "/admin/kategori",
      color: "bg-purple-500",
      stats: "Kategori",
      pending: "Aktif",
    },
  ] : [
    {
      title: "Pengelolaan Permohonan",
      description: "Kelola permohonan informasi publik",
      icon: FileText,
      href: "/admin/permohonan",
      color: "bg-blue-500",
      stats: `${stats.total} Total`,
      pending: `${stats.diajukan} Menunggu`,
    },
    {
      title: "Pengelolaan Keberatan",
      description: "Kelola keberatan informasi publik",
      icon: AlertTriangle,
      href: "/admin/keberatan",
      color: "bg-orange-500",
      stats: "0 Total",
      pending: "0 Menunggu",
    },
  ];

  const quickStats = [
    {
      label: "Permohonan Hari Ini",
      value: stats.diajukan,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Selesai Bulan Ini",
      value: stats.selesai,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Sedang Diproses",
      value: stats.diproses,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {userRole === 'PPID_PELAKSANA' ? '🏛️ Dashboard PPID Pelaksana' : '🏛️ Dashboard PPID Utama'}
          </h1>
          <p className="text-gray-600 mt-2">
            {userRole === 'PPID_PELAKSANA' 
              ? 'Kelola permohonan dan keberatan yang sedang diproses'
              : 'Kelola semua aspek layanan informasi publik Kabupaten Garut'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {managementSections.map((section, index) => (
            <Link key={index} href={section.href}>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${section.color}`}>
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {section.description}
                </p>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{section.stats}</span>
                  <span className="text-orange-600 font-medium">
                    {section.pending}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              data={chartData.daily.map(item => ({ label: item.date, value: item.count, color: '#3B82F6' }))}
              height={300}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-1 rounded-xl">
            <Chart
              type="bar"
              title="📅 Permohonan per Bulan (6 Bulan)"
              data={chartData.monthly}
              height={280}
            />
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-100 p-1 rounded-xl">
            <Chart
              type="bar"
              title="⚖️ Keberatan per Bulan"
              data={chartData.keberatan}
              height={280}
            />
          </div>
        </div>

        {userRole === 'PPID_UTAMA' && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-1 rounded-xl">
              <Chart
                type="line"
                title="📈 Progress Tahunan Permohonan & Keberatan"
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                  datasets: [
                    {
                      label: 'Permohonan',
                      data: chartData.yearlyPermohonan?.[new Date().getFullYear()] || Array(12).fill(0),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: false
                    },
                    {
                      label: 'Keberatan',
                      data: chartData.yearlyKeberatan?.[new Date().getFullYear()] || Array(12).fill(0),
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
        )}

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                📊 Laporan & Analitik
              </h3>
              <p className="text-blue-100">
                Buat laporan komprehensif untuk evaluasi kinerja PPID
              </p>
            </div>
            <Link href="/admin/laporan">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Buat Laporan
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Aktivitas Terbaru
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {stats.diajukan} permohonan baru menunggu review
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {stats.selesai} permohonan telah diselesaikan
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {stats.diproses} permohonan sedang dalam proses
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
