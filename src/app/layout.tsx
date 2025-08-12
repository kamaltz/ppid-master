import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik",
  description:
    "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008.",
  keywords:
    "PPID, Diskominfo, Kabupaten Garut, Informasi Publik, Transparansi, Akuntabilitas",
  authors: [{ name: "Diskominfo Kabupaten Garut" }],
  openGraph: {
    title: "PPID Diskominfo Kabupaten Garut",
    description:
      "Layanan Informasi Publik Dinas Komunikasi dan Informatika Kabupaten Garut",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
