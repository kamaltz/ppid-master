"use client";

import { useState } from "react";
import { X, FileText, Download } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface FileUploadProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
}

const FileUpload = ({ files, onFilesChange }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: FileItem[] = Array.from(selectedFiles).map(file => ({
      id: Date.now() + Math.random().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    onFilesChange([...files, ...newFiles]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') || type.includes('compressed')) return '🗜️';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFileSelect(e.dataTransfer.files);
          }
        }}
      >
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag & drop file atau{" "}
          <label className="text-blue-600 cursor-pointer hover:underline">
            pilih file
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-sm text-gray-500">
          Mendukung: PDF, DOC, DOCX, XLS, XLSX, ZIP, PNG, JPG (Max 10MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">File Terlampir:</h4>
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileIcon(file.type)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.url && (
                  <a
                    href={file.url}
                    download={file.name}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;