// src/app/page.tsx
import HeroSection from "@/components/HeroSection";
// Hapus import InformationGrid, ganti dengan PublicInformationList
import PublicInformationList from "@/components/PublicInformationList";
import ServiceSection from "@/components/ServiceSection";
import StatsSection from "@/components/StatsSection";
import AccessibilityHelper from "@/components/accessibility/AccessibilityHelper";

export default function Home() {
  return (
    <main>
      <HeroSection />

      <ServiceSection />

      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {/* Ubah judul agar sesuai dengan konten dinamis */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Daftar Informasi Publik Terkini
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan informasi publik yang disediakan oleh Diskominfo Kabupaten
              Garut. Data diperbarui secara berkala untuk menjamin transparansi.
            </p>
          </div>
          {/* Ganti komponen statis dengan komponen dinamis */}
          <PublicInformationList />
        </div>
      </section>

      <StatsSection />
      
      <AccessibilityHelper />
    </main>
  );
}
