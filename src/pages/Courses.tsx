import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import CourseCard from '../components/CourseCard';
import CourseFilters from '../components/CourseFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCourseStore } from '../store/courseStore';
import { useAuthStore } from '../store/authStore';
import { Course } from '../types/database';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { courses, loading, error, fetchCourses } = useCourseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredAndSortedCourses = React.useMemo(() => {
    let result = [...courses];

    // Filtrage par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtrage par niveau
    if (selectedLevel !== 'all') {
      result = result.filter((course) => course.level === selectedLevel);
    }

    // Tri
    switch (selectedSort) {
      case 'recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        // Simuler le tri par popularité (à remplacer par de vraies données)
        result.sort((a, b) => (Math.random() - 0.5));
        break;
      case 'rating':
        // Simuler le tri par note (à remplacer par de vraies données)
        result.sort((a, b) => (Math.random() - 0.5));
        break;
    }

    return result;
  }, [courses, searchTerm, selectedLevel, selectedSort]);

  if (error) {
    return (
      <AnimatedPage>
        <div className="min-h-screen py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
              Une erreur est survenue lors du chargement des cours.
            </div>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-dark-100">Nos Cours</h1>
              <p className="mt-2 text-dark-400">
                Découvrez nos formations pour maîtriser vos finances
              </p>
            </div>
            {user && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/courses/new')}
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un cours
              </motion.button>
            )}
          </div>

          <CourseFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Chargement des cours..." />
            </div>
          ) : filteredAndSortedCourses.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
            >
              {filteredAndSortedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={Math.random() * 100} // À remplacer par les vraies données
                  rating={3 + Math.random() * 2} // À remplacer par les vraies données
                  enrollments={Math.floor(10 + Math.random() * 90)} // À remplacer par les vraies données
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-dark-400 text-lg">
                Aucun cours ne correspond à vos critères.
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Courses;