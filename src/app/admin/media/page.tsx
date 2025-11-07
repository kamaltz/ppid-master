"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Download, Trash2, Eye, File, Image as ImageIcon, FileText } from "lucide-react";

interface MediaFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploader: string;
  path: string;
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const DOCUMENT_EXTENSIONS = new Set(['.doc', '.docx', '.xls', '.xlsx', '.html', '.txt', '.json', '.md']);

export default function MediaManagementPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const { token } = useAuth();

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/media", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setFiles(data.data);
        setFilteredFiles(data.data);
      } else {
        throw new Error(data.error || 'API request failed');
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
      alert('Gagal memuat daftar file. Silakan coba lagi.');
      setFiles([]);
      setFilteredFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const deleteFile = async (filename: string) => {
    if (!confirm(`Yakin ingin menghapus file ${filename}?`)) return;
    
    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ filename })
      });
      
      if (response.ok) {
        alert('File berhasil dihapus');
        fetchFiles();
      } else {
        const errorData = await response.json();
        alert(`Gagal menghapus file: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert('Terjadi kesalahan saat menghapus file');
    }
  };

  const bulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedFiles.size} file?`)) return;

    try {
      const promises = Array.from(selectedFiles).map(filename =>
        fetch("/api/admin/media", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ filename })
        })
      );

      await Promise.all(promises);
      alert('File berhasil dihapus');
      setSelectedFiles(new Set());
      fetchFiles();
    } catch (error) {
      console.error("Failed to delete files:", error);
      alert('Terjadi kesalahan saat menghapus file');
    }
  };

  const downloadFile = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/api/download?file=${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const bulkDownload = () => {
    if (selectedFiles.size === 0) return;
    
    Array.from(selectedFiles).forEach((filename, index) => {
      setTimeout(() => downloadFile(filename), index * 500);
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.name)));
    }
  };

  const toggleSelectFile = (filename: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    const filtered = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || 
        (typeFilter === "image" && IMAGE_EXTENSIONS.has(file.type)) ||
        (typeFilter === "pdf" && file.type === '.pdf') ||
        (typeFilter === "document" && DOCUMENT_EXTENSIONS.has(file.type));
      
      return matchesSearch && matchesType;
    });
    
    setFilteredFiles(filtered);
  }, [files, searchTerm, typeFilter]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (IMAGE_EXTENSIONS.has(type)) {
      return <ImageIcon className="w-5 h-5 text-green-600" aria-hidden="true" />;
    } else if (type === '.pdf') {
      return <FileText className="w-5 h-5 text-red-600" aria-hidden="true" />;
    } else {
      return <File className="w-5 h-5 text-blue-600" aria-hidden="true" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Media</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredFiles.length} file
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedFiles.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="text-sm font-medium text-blue-900">
            {selectedFiles.size} file dipilih
          </div>
          <div className="flex gap-2">
            <button
              onClick={bulkDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Semua
            </button>
            <button
              onClick={bulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Semua
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama file..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tipe File</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">Semua Tipe</option>
              <option value="image">Gambar</option>
              <option value="pdf">PDF</option>
              <option value="document">Dokumen</option>
            </select>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat file...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Tidak ada file ditemukan</div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Pilih Semua ({filteredFiles.length})
                </span>
              </label>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredFiles.map((file, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.name)}
                        onChange={() => toggleSelectFile(file.name)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      {getFileIcon(file.type)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <div className="flex flex-col gap-1 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-4">
                            <span>{formatFileSize(file.size)}</span>
                            <span>Diupload: {new Date(file.uploadedAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                            <span>Oleh: {file.uploader}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Path: uploads/{file.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/uploads/${file.name}`, '_blank')}
                        className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
                        title="Lihat file"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => downloadFile(file.name)}
                        className="p-2 text-green-600 hover:text-green-800 rounded-lg hover:bg-green-50"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteFile(file.name)}
                        className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                        title="Hapus file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}