import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, User, ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionList from '../components/SectionList';
import SectionContent from '../components/SectionContent';
import CourseProgress from '../components/CourseProgress';
import CourseReviews from '../components/CourseReviews';
import { useCourseStore } from '../store/courseStore';
import { useAuthStore } from '../store/authStore';
import { useGlobalStore } from '../store/globalStore';
import { Section } from '../types/database';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addNotification } = useGlobalStore();
  const {
    currentCourse,
    sections,
    progress,
    reviews,
    loading,
    error,
    fetchCourse,
    fetchSections,
    fetchProgress,
    fetchReviews,
    deleteCourse,
    updateProgress,
    createReview,
    updateReview,
    deleteReview,
  } = useCourseStore();

  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse(id);
      fetchSections(id);
      fetchReviews(id);
      if (user) {
        fetchProgress(id);
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (sections.length > 0 && !currentSection) {
      setCurrentSection(sections[0]);
    }
  }, [sections]);

  const handleDelete = async () => {
    if (!currentCourse) return;
    try {
      await deleteCourse(currentCourse.id);
      navigate('/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleSectionClick = (section: Section) => {
    if (!user) {
      addNotification({
        type: 'info',
        message: 'Veuillez vous connecter pour accéder au contenu du cours',
        duration: 5000
      });
      return;
    }
    setCurrentSection(section);
  };

  const handleSectionComplete = async () => {
    if (!currentSection || !user) return;
    const sectionProgress = progress.find(p => p.section_id === currentSection.id);
    await updateProgress(currentSection.id, !sectionProgress?.completed);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Chargement du cours..." />
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
          {error || 'Cours non trouvé'}
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === currentCourse.author_id;

  return (
    <AnimatedPage>
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center text-dark-400 hover:text-dark-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Retour aux cours
            </button>

            {isAuthor && (
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/courses/${currentCourse.id}/edit`)}
                  className="btn-secondary flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-secondary bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-700 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </motion.button>
              </div>
            )}
          </div>

          {/* Course Hero */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img
              src={currentCourse.image_url}
              alt={currentCourse.title}
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                {currentCourse.title}
              </h1>
              <div className="flex items-center space-x-6 text-dark-200">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  {currentCourse.duration} minutes
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {sections.length} sections
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {currentCourse.author_id}
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Current Section Content */}
              {currentSection && user && (
                <div className="card p-6">
                  <h2 className="text-2xl font-bold text-dark-100 mb-6">
                    {currentSection.title}
                  </h2>
                  <SectionContent
                    section={currentSection}
                    onComplete={handleSectionComplete}
                    isCompleted={progress.find(p => p.section_id === currentSection.id)?.completed || false}
                  />
                </div>
              )}

              {!user && (
                <div className="card p-6 text-center">
                  <h2 className="text-2xl font-bold text-dark-100 mb-4">
                    Connectez-vous pour accéder au contenu
                  </h2>
                  <p className="text-dark-400 mb-6">
                    Pour suivre ce cours et accéder à tout son contenu, vous devez vous connecter ou créer un compte.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => navigate('/signin')}
                      className="btn-primary"
                    >
                      Se connecter
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="btn-secondary"
                    >
                      S'inscrire
                    </button>
                  </div>
                </div>
              )}

              {/* Course Reviews */}
              <CourseReviews
                reviews={reviews}
                courseId={currentCourse.id}
                onCreateReview={createReview}
                onUpdateReview={updateReview}
                onDeleteReview={deleteReview}
              />
            </div>

            <div className="lg:col-span-1 space-y-8">
              {/* Course Progress */}
              {user && (
                <CourseProgress
                  sections={sections}
                  progress={progress}
                />
              )}

              {/* Section List */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-dark-100 mb-4">
                  Contenu du cours
                </h3>
                <SectionList
                  sections={sections}
                  progress={progress}
                  currentSectionId={currentSection?.id}
                  onSectionClick={handleSectionClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4 border border-dark-700"
            >
              <h3 className="text-xl font-bold text-dark-100 mb-4">
                Supprimer le cours
              </h3>
              <p className="text-dark-300 mb-6">
                Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-secondary bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-700"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default CourseDetail;