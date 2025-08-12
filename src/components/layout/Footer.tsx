import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Informasi Kontak */}
          <div>
            <h3 className="text-lg font-bold mb-4">Kontak PPID</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Jl. Pembangunan No. 1, Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>(0262) 232945</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>ppid@garutkab.go.id</span>
              </div>
            </div>
          </div>

          {/* Jam Layanan */}
          <div>
            <h3 className="text-lg font-bold mb-4">Jam Layanan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Senin - Jumat</span>
              </div>
              <p className="ml-6">08:00 - 16:00 WIB</p>
              <p className="text-blue-200 text-xs mt-2">
                *Kecuali hari libur nasional
              </p>
            </div>
          </div>

          {/* Link Penting */}
          <div>
            <h3 className="text-lg font-bold mb-4">Link Penting</h3>
            <div className="space-y-2 text-sm">
              <Link href="/permohonan" className="flex items-center hover:text-blue-200 transition-colors">
                <ExternalLink className="h-3 w-3 mr-2" />
                Permohonan Informasi
              </Link>
              <Link href="/keberatan" className="flex items-center hover:text-blue-200 transition-colors">
                <ExternalLink className="h-3 w-3 mr-2" />
                Pengajuan Keberatan
              </Link>
              <Link href="/sop" className="flex items-center hover:text-blue-200 transition-colors">
                <ExternalLink className="h-3 w-3 mr-2" />
                SOP Layanan
              </Link>
              <Link href="/dip" className="flex items-center hover:text-blue-200 transition-colors">
                <ExternalLink className="h-3 w-3 mr-2" />
                Daftar Informasi Publik
              </Link>
            </div>
          </div>

          {/* Tentang */}
          <div>
            <h3 className="text-lg font-bold mb-4">PPID Diskominfo</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Melayani permintaan informasi publik sesuai UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik.
            </p>
            <div className="mt-4">
              <Link href="https://garutkab.go.id" className="text-sm hover:text-blue-200 transition-colors">
                www.garutkab.go.id
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue-700 mt-8 pt-6 text-center text-sm text-blue-200">
          <p>&copy; 2024 PPID Dinas Komunikasi dan Informatika Kabupaten Garut. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;