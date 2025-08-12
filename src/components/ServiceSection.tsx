import { FileText, Clock, Shield, Users } from "lucide-react";

const services = [
  {
    icon: <FileText className="h-8 w-8 text-blue-800" />,
    title: "Permohonan Informasi",
    description: "Ajukan permohonan informasi publik sesuai kebutuhan Anda",
    link: "/permohonan"
  },
  {
    icon: <Clock className="h-8 w-8 text-green-600" />,
    title: "Layanan Cepat",
    description: "Proses permohonan maksimal 10 hari kerja",
    link: "/sop"
  },
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: "Pengajuan Keberatan",
    description: "Sampaikan keberatan atas layanan informasi",
    link: "/keberatan"
  },
  {
    icon: <Users className="h-8 w-8 text-purple-600" />,
    title: "Konsultasi",
    description: "Konsultasi terkait informasi publik",
    link: "/konsultasi"
  }
];

const ServiceSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Layanan PPID
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan berbagai layanan informasi publik untuk memenuhi hak masyarakat akan keterbukaan informasi
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-slate-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 text-center group cursor-pointer"
            >
              <div className="mb-4 flex justify-center">
                {service.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-800 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;