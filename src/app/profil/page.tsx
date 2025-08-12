"use client";

import { useState, useEffect } from "react";

export default function ProfilPage() {
  const [pageData, setPageData] = useState({
    title: "Profil PPID",
    content: "",
    files: [],
    sections: []
  });

  useEffect(() => {
    // Load from localStorage or API
    const savedData = localStorage.getItem("page_profil-ppid");
    if (savedData) {
      setPageData(JSON.parse(savedData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">{pageData.title}</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Pejabat Pengelola Informasi dan Dokumentasi Dinas Komunikasi dan Informatika Kabupaten Garut
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
          
          {/* Default Content Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Visi</h3>
              <p className="text-gray-600">
                Mewujudkan pelayanan informasi publik yang transparan, akuntabel, dan berkualitas untuk mendukung tata kelola pemerintahan yang baik.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Misi</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Menyelenggarakan pelayanan informasi publik yang cepat dan tepat</li>
                <li>• Meningkatkan kualitas pengelolaan informasi dan dokumentasi</li>
                <li>• Membangun sistem informasi yang terintegrasi</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Tugas Pokok</h3>
              <p className="text-gray-600">
                Melaksanakan pengumpulan, pengolahan, penyimpanan, pendokumentasian, penyediaan, dan pelayanan informasi publik.
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
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Dokumen Terkait</h3>
              <div className="grid gap-4">
                {pageData.files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">📄</div>
                      <div>
                        <div className="font-semibold text-gray-800">{file.name}</div>
                        <div className="text-sm text-gray-500">Dokumen resmi PPID</div>
                      </div>
                    </div>
                    {file.url && (
                      <a
                        href={file.url}
                        download={file.name}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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