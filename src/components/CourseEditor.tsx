import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { Section } from '../types/database';

interface CourseEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
}

const CourseEditor: React.FC<CourseEditorProps> = ({
  sections,
  onSectionsChange,
  onSave,
  isLoading = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddSection = () => {
    const newSection: Partial<Section> = {
      title: 'Nouvelle section',
      content: '',
      order_index: sections.length,
    };
    onSectionsChange([...sections, newSection as Section]);
  };

  const handleDeleteSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    onSectionsChange(newSections);
  };

  const handleSectionChange = (index: number, field: keyof Section, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onSectionsChange(newSections);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);

    onSectionsChange(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-100">Contenu du cours</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleAddSection}
            className="btn-secondary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une section
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-6"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 flex items-center">
                <button className="p-2 cursor-move text-dark-400 hover:text-dark-200">
                  <GripVertical className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                  className="input flex-1 ml-2"
                  placeholder="Titre de la section"
                />
              </div>
              <button
                onClick={() => handleDeleteSection(index)}
                className="p-2 text-dark-400 hover:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div data-color-mode="dark">
              <MDEditor
                value={section.content}
                onChange={(value) => handleSectionChange(index, 'content', value || '')}
                preview="edit"
                height={300}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CourseEditor;