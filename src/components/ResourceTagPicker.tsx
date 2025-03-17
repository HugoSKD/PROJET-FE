import React from 'react';
import { motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { ResourceTag } from '../types/database';

interface ResourceTagPickerProps {
  tags: ResourceTag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  className?: string;
}

const ResourceTagPicker: React.FC<ResourceTagPickerProps> = ({
  tags,
  selectedTags,
  onTagSelect,
  className = '',
}) => {
  const tagCategories = {
    'Type de contenu': tags.filter(tag => ['article', 'video', 'podcast', 'livre', 'outil'].includes(tag.name)),
    'Sujets': tags.filter(tag => !['article', 'video', 'podcast', 'livre', 'outil'].includes(tag.name)),
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Object.entries(tagCategories).map(([category, categoryTags]) => (
        <div key={category}>
          <h3 className="text-dark-200 text-sm font-medium mb-2 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            {category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryTags.map((tag) => (
              <motion.button
                key={tag.id}
                onClick={() => onTagSelect(tag.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`group px-3 py-1.5 rounded-full text-sm transition-all flex items-center ${
                  selectedTags.includes(tag.id)
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'bg-dark-700/50 text-dark-300 border border-dark-600 hover:border-accent-500/30 hover:bg-dark-700'
                }`}
                style={{
                  backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : undefined,
                  borderColor: selectedTags.includes(tag.id) ? `${tag.color}40` : undefined,
                  color: selectedTags.includes(tag.id) ? tag.color : undefined,
                }}
              >
                {tag.name}
                {selectedTags.includes(tag.id) && (
                  <X className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceTagPicker;