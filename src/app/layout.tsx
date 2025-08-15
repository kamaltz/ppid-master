import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import DynamicLayout from "@/components/layout/DynamicLayout";
import { getGeneralSettings } from "@/lib/getSettings";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGeneralSettings();
  const settingsObj = settings as Record<string, unknown>;
  
  return {
    title: (settingsObj?.websiteTitle as string) || "PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik",
    description: (settingsObj?.websiteDescription as string) || "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.",
    keywords: "PPID, Diskominfo, Kabupaten Garut, Informasi Publik, Transparansi, Akuntabilitas",
    authors: [{ name: (settingsObj?.namaInstansi as string) || "Diskominfo Kabupaten Garut" }],
    openGraph: {
      title: (settingsObj?.namaInstansi as string) || "PPID Diskominfo Kabupaten Garut",
      description: (settingsObj?.websiteDescription as string) || "Layanan Informasi Publik Dinas Komunikasi dan Informatika Kabupaten Garut",
      type: "website",
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <DynamicLayout />
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
