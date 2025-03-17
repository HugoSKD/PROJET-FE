import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import CourseValidation from '../components/CourseValidation';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCourseWorkflowStore } from '../store/courseWorkflowStore';
import { useAuthStore } from '../store/authStore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const {
    pendingCourses,
    loading,
    error,
    fetchPendingCourses,
    approveCourse,
    rejectCourse,
  } = useCourseWorkflowStore();

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingCourses();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (error) {
    return (
      <AnimatedPage>
        <div className="min-h-screen py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
              {error}
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
          <h1 className="text-3xl font-bold text-dark-100 mb-8">
            Dashboard Administrateur
          </h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">
                Cours en attente de validation ({pendingCourses.length})
              </h2>
              {pendingCourses.length > 0 ? (
                <div className="space-y-6">
                  {pendingCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <CourseValidation
                        course={course}
                        onApprove={() => approveCourse(course.id)}
                        onReject={(reason) => rejectCourse(course.id, reason)}
                        isLoading={loading}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-dark-400">
                  Aucun cours en attente de validation
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AdminDashboard;