"use client";

import { useState } from "react";
import { ROLES } from "@/lib/roleUtils";
import RoleGuard from "@/components/auth/RoleGuard";
import { Calendar, FileText, Download, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLaporanPage() {
  const { token } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [reportData, setReportData] = useState<{
    title: string;
    period: string;
    summary?: Record<string, string | number>;
    details?: Record<string, unknown>[];
  } | null>(null);
  
  const reportTemplates = [
    { id: 'permohonan-bulanan', name: 'Laporan Permohonan Informasi', desc: 'Ringkasan permohonan informasi berdasarkan periode' },
    { id: 'keberatan-bulanan', name: 'Laporan Keberatan', desc: 'Ringkasan keberatan informasi berdasarkan periode' },
    { id: 'kinerja-ppid', name: 'Laporan Kinerja PPID', desc: 'Evaluasi kinerja layanan PPID' },
    { id: 'informasi-publik', name: 'Laporan Informasi Publik', desc: 'Data informasi publik yang tersedia' },
    { id: 'akun-pengguna', name: 'Laporan Akun Pengguna', desc: 'Data akun pengguna terdaftar' },
    { id: 'log-aktivitas', name: 'Laporan Log Aktivitas', desc: 'Log seluruh aktivitas sistem' }
  ];

  const generateReport = async () => {
    if (!selectedTemplate) {
      alert('Pilih template laporan terlebih dahulu!');
      return;
    }
    
    if (showDateFilter && (!startDate || !endDate)) {
      alert('Pilih rentang tanggal terlebih dahulu!');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/laporan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: selectedTemplate,
          startDate: showDateFilter ? startDate : null,
          endDate: showDateFilter ? endDate : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        alert('Gagal generate laporan: ' + data.error);
      }
    } catch {
      alert('Terjadi kesalahan saat generate laporan');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = (format: string) => {
    if (!reportData) return;
    
    let content = '';
    let filename = `laporan_${selectedTemplate}_${new Date().toISOString().split('T')[0]}`;
    let mimeType = 'text/plain';
    
    if (format === 'csv') {
      if (reportData.details && reportData.details.length > 0) {
        const headers = Object.keys(reportData.details[0]).join(',');
        const rows = reportData.details.map((item: Record<string, unknown>) => 
          Object.values(item).map(val => {
            const stringVal = String(val || '');
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
              return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
          }).join(',')
        ).join('\n');
        content = headers + '\n' + rows;
      } else {
        content = 'No data available';
      }
      filename += '.csv';
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(reportData, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    } else if (format === 'txt') {
      content = `${reportData.title}\n`;
      content += `Periode: ${reportData.period}\n`;
      content += `Tanggal Export: ${new Date().toLocaleString('id-ID')}\n\n`;
      
      if (reportData.summary) {
        content += 'RINGKASAN LAPORAN:\n';
        content += '='.repeat(50) + '\n';
        Object.entries(reportData.summary).forEach(([key, value]) => {
          content += `${key.padEnd(20)}: ${value}\n`;
        });
        content += '\n';
      }
      
      if (reportData.details && reportData.details.length > 0) {
        content += 'DETAIL DATA:\n';
        content += '='.repeat(50) + '\n';
        reportData.details.forEach((item: Record<string, unknown>, index) => {
          content += `\n[${index + 1}] `;
          Object.entries(item).forEach(([key, value]) => {
            content += `${key}: ${value}\n    `;
          });
        });
      }
      
      filename += '.txt';
    } else if (format === 'excel') {
      // Generate Excel-compatible CSV with UTF-8 BOM
      if (reportData.details && reportData.details.length > 0) {
        const headers = Object.keys(reportData.details[0]).join('\t');
        const rows = reportData.details.map((item: Record<string, unknown>) => 
          Object.values(item).map(val => {
            const stringVal = String(val || '');
            return stringVal.replace(/\t/g, ' ').replace(/\n/g, ' ');
          }).join('\t')
        ).join('\n');
        content = '\uFEFF' + headers + '\n' + rows; // UTF-8 BOM for Excel
      } else {
        content = '\uFEFFNo data available';
      }
      filename += '.xls';
      mimeType = 'application/vnd.ms-excel';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    alert(`Laporan berhasil diexport sebagai ${format.toUpperCase()}!`);
  };

  return (
    <RoleGuard requiredRoles={[ROLES.ADMIN, ROLES.PPID_UTAMA, ROLES.PPID_PELAKSANA, ROLES.ATASAN_PPID]}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Generator Laporan</h1>
        
        {/* Template Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Pilih Template Laporan
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
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
              
              <div className="mb-6">
                <button 
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Laporan'}
                </button>
              </div>
              
              {reportData && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">{reportData.title}</h4>
                  <p className="text-sm text-green-700">Periode: {reportData.period}</p>
                  <p className="text-sm text-green-700">Total Data: {reportData.details?.length || 0} record</p>
                  {reportData.summary && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-green-800 mb-2">Ringkasan:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(reportData.summary).map(([key, value]) => (
                          <div key={key} className="text-green-700 bg-white p-2 rounded">
                            <strong>{key}:</strong> {value as string}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {reportData && (
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => exportReport('csv')}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                  <button 
                    onClick={() => exportReport('json')}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </button>
                  <button 
                    onClick={() => exportReport('txt')}
                    className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export TXT
                  </button>
                  {selectedTemplate === 'log-aktivitas' && (
                    <button 
                      onClick={() => exportReport('excel')}
                      className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Pilih template laporan terlebih dahulu untuk melihat opsi export.</p>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}