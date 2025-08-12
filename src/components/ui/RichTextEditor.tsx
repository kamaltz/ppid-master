"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Underline, Link, Image, FileText } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (files: FileList) => void;
}

const RichTextEditor = ({ value, onChange, onFileUpload }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileUpload(e.target.files);
    }
  };

  const insertLink = () => {
    if (linkText && linkUrl) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" class="text-blue-600 underline">${linkText}</a>`;
      execCommand('insertHTML', linkHtml);
      setShowLinkDialog(false);
      setLinkText("");
      setLinkUrl("");
    }
  };

  const insertImage = () => {
    const url = prompt("Masukkan URL gambar:");
    if (url) {
      execCommand('insertImage', url);
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Image className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[200px] focus:outline-none"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Tambah Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Teks Link</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nama link yang ditampilkan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={insertLink}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Tambah
                </button>
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;