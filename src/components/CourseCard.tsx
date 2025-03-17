import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ChevronRight, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Course } from '../types/database';

interface CourseCardProps {
  course: Course;
  progress?: number;
  rating?: number;
  enrollments?: number;
}

const levelColors = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const levelLabels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  progress = 0,
  rating = 0,
  enrollments = 0
}) => {
  return (
    <Link to={`/courses/${course.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card overflow-hidden cursor-pointer group relative"
      >
        {progress > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-dark-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-accent-500"
            />
          </div>
        )}

        <div className="relative">
          <img
            src={course.image_url}
            alt={course.title}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border ${levelColors[course.level]}`}>
            {levelLabels[course.level]}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-dark-100 group-hover:text-accent-500 transition-colors">
            {course.title}
          </h3>
          <p className="mt-2 text-dark-400 line-clamp-2">
            {course.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-dark-300">
                <Clock className="w-4 h-4 mr-1" />
                <span>{course.duration} min</span>
              </div>
              <div className="flex items-center text-dark-300">
                <Users className="w-4 h-4 mr-1" />
                <span>{enrollments}</span>
              </div>
              {rating > 0 && (
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-accent-500 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default CourseCard;