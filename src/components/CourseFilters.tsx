import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

interface CourseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const levels = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
];

const sortOptions = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'popular', label: 'Plus populaires' },
  { value: 'rating', label: 'Mieux notés' },
];

const CourseFilters: React.FC<CourseFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedSort,
  onSortChange,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`btn-secondary flex items-center ${
            showFilters ? 'bg-accent-500 text-white hover:bg-accent-600' : ''
          }`}
        >
          {showFilters ? (
            <X className="w-5 h-5 mr-2" />
          ) : (
            <Filter className="w-5 h-5 mr-2" />
          )}
          Filtres
        </button>
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
        <div className="pt-4 space-y-4">
          <div>
            <label className="block text-dark-200 text-sm font-medium mb-2">
              Niveau
            </label>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => onLevelChange(level.value)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedLevel === level.value
                      ? 'bg-accent-500 text-white'
                      : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-dark-200 text-sm font-medium mb-2">
              Trier par
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedSort === option.value
                      ? 'bg-accent-500 text-white'
                      : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseFilters;