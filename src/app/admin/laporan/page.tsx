"use client";

import { useState } from "react";
import { useRoleAccess } from "@/lib/useRoleAccess";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { Calendar, FileText, Download, Filter } from "lucide-react";

export default function AdminLaporanPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  const reportTemplates = [
    { id: 'permohonan-bulanan', name: 'Laporan Permohonan Bulanan', desc: 'Ringkasan permohonan informasi per bulan' },
    { id: 'keberatan-bulanan', name: 'Laporan Keberatan Bulanan', desc: 'Ringkasan keberatan informasi per bulan' },
    { id: 'kinerja-ppid', name: 'Laporan Kinerja PPID', desc: 'Evaluasi kinerja layanan PPID' },
    { id: 'statistik-layanan', name: 'Statistik Layanan', desc: 'Data statistik layanan informasi publik' },
    { id: 'rekapitulasi-tahunan', name: 'Rekapitulasi Tahunan', desc: 'Laporan komprehensif tahunan' },
    { id: 'analisis-kepuasan', name: 'Analisis Kepuasan Pemohon', desc: 'Survey dan analisis kepuasan layanan' }
  ];

  const generateReport = async (format: string) => {
    if (!selectedTemplate) {
      alert('Pilih template laporan terlebih dahulu!');
      return;
    }
    
    if (showDateFilter && (!startDate || !endDate)) {
      alert('Pilih rentang tanggal terlebih dahulu!');
      return;
    }
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      const period = showDateFilter ? `${startDate} s/d ${endDate}` : 'periode default';
      alert(`Laporan "${template?.name}" (${period}) berhasil diunduh dalam format ${format.toUpperCase()}!`);
      setIsGenerating(false);
    }, 2000);
  };
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Generator Laporan</h1>
      
      {/* Template Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Pilih Template Laporan
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {reportTemplates.map((template) => (
            <div 
              key={template.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === template.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <h4 className="font-semibold text-gray-800">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Filter Periode
          </h3>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showDateFilter ? 'Sembunyikan' : 'Tampilkan'} Filter
          </button>
        </div>
        
        {showDateFilter && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Laporan
        </h3>
        
        {selectedTemplate ? (
          <div>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Template:</strong> {reportTemplates.find(t => t.id === selectedTemplate)?.name}
              </p>
              {showDateFilter && startDate && endDate && (
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Periode:</strong> {startDate} s/d {endDate}
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => generateReport('pdf')}
                disabled={isGenerating}
                className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Export PDF'}
              </button>
              
              <button 
                onClick={() => generateReport('word')}
                disabled={isGenerating}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Export Word'}
              </button>
              
              <button 
                onClick={() => generateReport('excel')}
                disabled={isGenerating}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Export Excel'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Pilih template laporan terlebih dahulu untuk menampilkan opsi export.</p>
        )}
      </div>
    </div>
  );
}