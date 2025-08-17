"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Download, Trash2, Eye, File, Image, FileText } from "lucide-react";

interface MediaFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploader: string;
}

export default function MediaManagementPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/admin/media", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFiles(data.data);
        setFilteredFiles(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        fetchFiles();
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  useEffect(() => {
    let filtered = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || 
        (typeFilter === "image" && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(file.type)) ||
        (typeFilter === "pdf" && file.type === '.pdf') ||
        (typeFilter === "document" && ['.doc', '.docx', '.xls', '.xlsx'].includes(file.type));
      
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
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(type)) {
      return <Image className="w-5 h-5 text-green-600" />;
    } else if (type === '.pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else {
      return <File className="w-5 h-5 text-blue-600" />;
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
          <div className="divide-y divide-gray-200">
            {filteredFiles.map((file, index) => (
              <div key={index} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{file.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>Diupload: {new Date(file.uploadedAt).toLocaleDateString('id-ID')}</span>
                        <span>Oleh: {file.uploader}</span>
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
                    
                    <a
                      href={`/uploads/${file.name}`}
                      download
                      className="p-2 text-green-600 hover:text-green-800 rounded-lg hover:bg-green-50"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    
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
        )}
      </div>
    </div>
  );
}