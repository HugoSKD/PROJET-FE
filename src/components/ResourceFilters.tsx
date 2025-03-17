import React from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, TrendingUp, Clock, ThumbsUp } from 'lucide-react';
import ResourceTagPicker from './ResourceTagPicker';
import { ResourceTag } from '../types/database';

interface ResourceFiltersProps {
  tags: ResourceTag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const sortOptions = [
  { value: 'popular', label: 'Les plus populaires', icon: TrendingUp },
  { value: 'recent', label: 'Plus récents', icon: Clock },
  { value: 'rating', label: 'Mieux notés', icon: ThumbsUp },
];

const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  tags,
  selectedTags,
  onTagSelect,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une ressource..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className={`btn-secondary flex items-center ${
              showFilters ? 'bg-accent-500 text-white hover:bg-accent-600' : ''
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filtres
          </button>
          <div className="border-l border-dark-600 pl-2 flex gap-2">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-colors ${
                    sortBy === option.value
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'text-dark-400 hover:bg-dark-700/50 hover:text-dark-200'
                  }`}
                  title={option.label}
                >
                  <Icon className="w-5 h-5" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: showFilters ? 'auto' : 0,
          opacity: showFilters ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <ResourceTagPicker
          tags={tags}
          selectedTags={selectedTags}
          onTagSelect={onTagSelect}
          className="pt-4"
        />
      </motion.div>
    </div>
  );
};

export default ResourceFilters;