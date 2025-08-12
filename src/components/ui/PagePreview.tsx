"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PagePreviewProps {
  title: string;
  content: string;
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
  }>;
}

const PagePreview = ({ title, content, files }: PagePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!showPreview) {
    return (
      <button
        onClick={() => setShowPreview(true)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
      >
        <Eye className="w-4 h-4" />
        Preview Halaman
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Preview: {title}</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <EyeOff className="w-4 h-4" />
            Tutup
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose max-w-none">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <div 
              className="content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {files.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">File Lampiran</h3>
                <div className="grid gap-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {file.type.includes('pdf') ? '📄' : 
                           file.type.includes('word') ? '📝' : 
                           file.type.includes('excel') ? '📊' : 
                           file.type.includes('zip') ? '🗜️' : 
                           file.type.includes('image') ? '🖼️' : '📎'}
                        </div>
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      {file.url && (
                        <a
                          href={file.url}
                          download={file.name}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
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
        </div>
      </div>
    </div>
  );
};

export default PagePreview;