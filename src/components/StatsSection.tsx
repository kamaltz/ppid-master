import { TrendingUp, FileCheck, Clock, FileText } from "lucide-react";
import { usePublicStats } from '@/hooks/usePublicStats';

const StatsSection = () => {
  const { stats, isLoading } = usePublicStats();

  const statsData = [
    {
      icon: <FileCheck className="h-8 w-8 text-white" />,
      number: stats.permintaanSelesai.toString(),
      label: "Permohonan Selesai",
      description: "Total permohonan yang telah diproses"
    },
    {
      icon: <Clock className="h-8 w-8 text-white" />,
      number: stats.rataRataHari.toString(),
      label: "Hari Rata-rata",
      description: "Waktu penyelesaian permohonan"
    },
    {
      icon: <FileText className="h-8 w-8 text-white" />,
      number: stats.totalInformasi.toString(),
      label: "Informasi Tersedia",
      description: "Total informasi publik"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-white" />,
      number: "24/7",
      label: "Akses Online",
      description: "Portal informasi tersedia"
    }
  ];

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="text-white">Memuat statistik...</div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 bg-gradient-to-r from-blue-800 to-blue-600">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Kinerja Layanan PPID
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Komitmen kami dalam memberikan layanan informasi publik yang berkualitas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center hover:bg-white/20 transition-all duration-300"
            >
              <div className="mb-4 flex justify-center">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </h3>
              <p className="text-blue-100 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;