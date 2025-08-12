// src/components/HeroSection.tsx
"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();

  const handlePermohonan = () => {
    router.push('/permohonan');
  };

  const handleDIP = () => {
    router.push('/dip');
  };

  return (
    <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6">
          <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
            Pejabat Pengelola Informasi dan Dokumentasi
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          PPID Dinas Komunikasi dan Informatika<br />
          <span className="text-blue-200">Kabupaten Garut</span>
        </h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-blue-100">
          Melayani permintaan informasi publik secara transparan dan akuntabel sesuai 
          UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handlePermohonan}
            className="bg-white text-blue-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Ajukan Permohonan
          </button>
          <button 
            onClick={handleDIP}
            className="border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:text-blue-800 transition-all"
          >
            Lihat DIP
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
