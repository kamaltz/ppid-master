import { Calendar, AlertTriangle, Info, FileText } from "lucide-react";

const infoItems = [
  {
    icon: <Calendar className="h-10 w-10 text-blue-800" />,
    title: "Informasi Berkala",
    description: "Informasi yang wajib disediakan dan diumumkan secara rutin seperti laporan keuangan, profil badan publik, dan rencana kerja.",
    examples: "Laporan keuangan, LAKIP, Profil"
  },
  {
    icon: <AlertTriangle className="h-10 w-10 text-red-500" />,
    title: "Informasi Serta Merta",
    description: "Informasi yang dapat mengancam hajat hidup orang banyak dan ketertiban umum yang harus diumumkan segera.",
    examples: "Bencana alam, Wabah penyakit, Gangguan layanan"
  },
  {
    icon: <Info className="h-10 w-10 text-emerald-500" />,
    title: "Informasi Setiap Saat",
    description: "Informasi yang wajib tersedia setiap saat dan dapat diakses publik tanpa perlu mengajukan permohonan.",
    examples: "Daftar informasi publik, SOP, Struktur organisasi"
  },
  {
    icon: <FileText className="h-10 w-10 text-purple-500" />,
    title: "Informasi Dikecualikan",
    description: "Informasi yang tidak dapat diberikan kepada publik karena sifatnya yang rahasia atau dapat merugikan kepentingan umum.",
    examples: "Rahasia negara, Rahasia pribadi, Data strategis"
  }
];

const InformationGrid = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {infoItems.map((item, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-blue-800"
        >
          <div className="mb-4">{item.icon}</div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            {item.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
            {item.description}
          </p>
          <div className="text-xs text-blue-800 font-medium">
            Contoh: {item.examples}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InformationGrid;
