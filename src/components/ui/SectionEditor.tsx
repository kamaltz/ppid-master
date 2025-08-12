"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import FileUpload from "./FileUpload";

interface Section {
  id: string;
  title: string;
  content: string;
  type: "text" | "image" | "file" | "hero";
  order: number;
  files: any[];
}

interface SectionEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

const SectionEditor = ({ sections, onSectionsChange }: SectionEditorProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState({
    title: "",
    content: "",
    type: "text" as Section["type"],
    files: []
  });

  const addSection = () => {
    const section: Section = {
      id: Date.now().toString(),
      ...newSection,
      order: sections.length
    };
    onSectionsChange([...sections, section]);
    setNewSection({ title: "", content: "", type: "text", files: [] });
    setShowAddForm(false);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    onSectionsChange(sections.map(s => s.id === id ? { ...s, ...updates } : s));
    setEditingSection(null);
  };

  const deleteSection = (id: string) => {
    if (confirm("Hapus section ini?")) {
      onSectionsChange(sections.filter(s => s.id !== id));
    }
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex(s => s.id === id);
    if ((direction === "up" && index > 0) || (direction === "down" && index < sections.length - 1)) {
      const newSections = [...sections];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      onSectionsChange(newSections);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Kelola Section</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Section
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium mb-3">Tambah Section Baru</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Judul section"
              value={newSection.title}
              onChange={(e) => setNewSection({...newSection, title: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
            <select
              value={newSection.type}
              onChange={(e) => setNewSection({...newSection, type: e.target.value as Section["type"]})}
              className="border rounded px-3 py-2"
            >
              <option value="text">Text</option>
              <option value="hero">Hero Section</option>
              <option value="image">Image</option>
              <option value="file">File</option>
            </select>
            <RichTextEditor
              value={newSection.content}
              onChange={(content) => setNewSection({...newSection, content})}
              onFileUpload={() => {}}
            />
            <div className="flex gap-2">
              <button onClick={addSection} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Simpan
              </button>
              <button onClick={() => setShowAddForm(false)} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={section.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{section.title}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{section.type}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSection(section.id, "up")}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(section.id, "down")}
                  disabled={index === sections.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  onClick={() => setEditingSection(section.id)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {editingSection === section.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                <RichTextEditor
                  value={section.content}
                  onChange={(content) => updateSection(section.id, { content })}
                  onFileUpload={() => {}}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSection(null)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 line-clamp-2">
                <div dangerouslySetInnerHTML={{ __html: section.content.substring(0, 100) + "..." }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionEditor;