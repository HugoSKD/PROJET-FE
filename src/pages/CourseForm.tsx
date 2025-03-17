import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Upload } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCourseStore } from '../store/courseStore';
import { useAuthStore } from '../store/authStore';
import { Course } from '../types/database';

const CourseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentCourse, loading, error, createCourse, updateCourse, fetchCourse } = useCourseStore();

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    level: 'beginner',
    duration: 0,
    image_url: '',
    content: {},
  });

  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && currentCourse) {
      setFormData(currentCourse);
    }
  }, [id, currentCourse]);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!formData.title) throw new Error('Le titre est requis');
      if (!formData.description) throw new Error('La description est requise');
      if (!formData.image_url) throw new Error("L'image est requise");
      if (!formData.duration || formData.duration <= 0) throw new Error('La durée doit être supérieure à 0');

      const courseData = {
        ...formData,
        author_id: user.id,
      };

      if (id) {
        await updateCourse(id, courseData);
      } else {
        const newCourse = await createCourse(courseData);
        navigate(`/courses/${newCourse.id}`);
        return;
      }

      navigate(`/courses/${id}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-dark-400 hover:text-dark-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-dark-100">
              {id ? 'Modifier le cours' : 'Créer un nouveau cours'}
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Chargement..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {(error || formError) && (
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
                  {error || formError}
                </div>
              )}

              <div className="card p-6 space-y-6">
                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    Titre du cours
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="ex: Les bases de l'investissement"
                  />
                </div>

                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="input w-full resize-none"
                    placeholder="Décrivez votre cours..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-dark-200 text-sm font-medium mb-2">
                      Niveau
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="input w-full"
                    >
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-dark-200 text-sm font-medium mb-2">
                      Durée (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      min="0"
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {formData.image_url && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : id ? (
                    'Mettre à jour'
                  ) : (
                    'Créer le cours'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CourseForm;