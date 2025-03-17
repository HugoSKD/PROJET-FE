import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { Section, Progress } from '../types/database';

interface SectionListProps {
  sections: Section[];
  progress: Progress[];
  currentSectionId?: string;
  onSectionClick: (section: Section) => void;
}

const SectionList: React.FC<SectionListProps> = ({
  sections,
  progress,
  currentSectionId,
  onSectionClick,
}) => {
  const getSectionProgress = (sectionId: string) => {
    return progress.find((p) => p.section_id === sectionId);
  };

  return (
    <div className="space-y-2">
      {sections.map((section, index) => {
        const sectionProgress = getSectionProgress(section.id);
        const isCompleted = sectionProgress?.completed;
        const isCurrent = section.id === currentSectionId;

        return (
          <motion.button
            key={section.id}
            onClick={() => onSectionClick(section)}
            className={`w-full p-4 rounded-lg flex items-center justify-between transition-all ${
              isCurrent
                ? 'bg-accent-500/10 border border-accent-500'
                : 'bg-dark-700/50 hover:bg-dark-700 border border-transparent'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-dark-400" />
                )}
              </div>
              <div className="text-left">
                <span className="text-sm text-dark-400">Section {index + 1}</span>
                <h3 className={`font-medium ${isCurrent ? 'text-accent-500' : 'text-dark-100'}`}>
                  {section.title}
                </h3>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 ${isCurrent ? 'text-accent-500' : 'text-dark-400'}`} />
          </motion.button>
        );
      })}
    </div>
  );
};

export default SectionList;