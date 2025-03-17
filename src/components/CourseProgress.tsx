import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Progress, Section } from '../types/database';

interface CourseProgressProps {
  sections: Section[];
  progress: Progress[];
}

const CourseProgress: React.FC<CourseProgressProps> = ({ sections, progress }) => {
  const completedSections = progress.filter((p) => p.completed).length;
  const progressPercentage = Math.round((completedSections / sections.length) * 100);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-100">Progression du cours</h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-accent-500">{progressPercentage}%</span>
          {progressPercentage === 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 text-green-500"
            >
              <CheckCircle className="w-6 h-6" />
            </motion.div>
          )}
        </div>
      </div>

      <div className="w-full bg-dark-700 rounded-full h-2 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          className="bg-accent-500 h-2 rounded-full transition-all duration-300"
        />
      </div>

      <div className="text-sm text-dark-400">
        {completedSections} sur {sections.length} sections terminées
      </div>
    </div>
  );
};

export default CourseProgress;