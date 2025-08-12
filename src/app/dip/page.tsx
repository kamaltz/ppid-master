"use client";

import { useState, useEffect } from "react";

export default function DIPPage() {
  const [pageData, setPageData] = useState({
    title: "Daftar Informasi Publik (DIP)",
    content: "",
    files: [],
    sections: []
  });

  useEffect(() => {
    // Load from localStorage or API
    const savedData = localStorage.getItem("page_dip");
    if (savedData) {
      setPageData(JSON.parse(savedData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-800 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">{pageData.title}</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Katalog informasi yang wajib disediakan dan diumumkan oleh PPID Diskominfo Kabupaten Garut
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {pageData.content && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: pageData.content }}
              />
            </div>
          )}
          
          {/* Information Categories */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Informasi Berkala</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Laporan Keuangan Daerah</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Laporan Kinerja Instansi (LAKIP)</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Rencana Strategis (Renstra)</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Rencana Kerja Tahunan</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Laporan Penyelenggaraan Pemerintahan</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Informasi Serta Merta</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Informasi keadaan darurat</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Keselamatan dan keamanan publik</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Informasi bencana alam</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Ancaman hajat hidup orang banyak</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Informasi Setiap Saat</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Struktur Organisasi</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Profil Pejabat</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Peraturan Daerah</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Data Statistik Daerah</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Prosedur Pelayanan Publik</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Informasi Dikecualikan</h3>
              </div>
              <p className="text-gray-600">
                Informasi yang dikecualikan sesuai peraturan perundang-undangan, termasuk yang dapat menghambat penegakan hukum dan membahayakan keamanan negara.
              </p>
            </div>
          </div>
          
          {/* Custom Sections */}
          {pageData.sections && pageData.sections.length > 0 && (
            <div className="space-y-8">
              {pageData.sections.map((section: any) => (
                <div key={section.id} className="bg-white rounded-lg shadow-lg p-8">
                  {section.title && (
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">{section.title}</h3>
                  )}
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Files Section */}
          {pageData.files && pageData.files.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Dokumen DIP</h3>
              <div className="grid gap-4">
                {pageData.files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">📄</div>
                      <div>
                        <div className="font-semibold text-gray-800">{file.name}</div>
                        <div className="text-sm text-gray-500">Dokumen informasi publik</div>
                      </div>
                    </div>
                    {file.url && (
                      <a
                        href={file.url}
                        download={file.name}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}