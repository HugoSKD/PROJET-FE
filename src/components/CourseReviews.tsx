import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, User, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Review } from '../types/database';
import { useAuthStore } from '../store/authStore';

interface CourseReviewsProps {
  reviews: Review[];
  courseId: string;
  onCreateReview: (review: Partial<Review>) => Promise<void>;
  onUpdateReview: (id: string, review: Partial<Review>) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({
  reviews,
  courseId,
  onCreateReview,
  onUpdateReview,
  onDeleteReview,
}) => {
  const { user } = useAuthStore();
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [error, setError] = useState('');

  const userReview = reviews.find((review) => review.user_id === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingReview) {
        await onUpdateReview(editingReview.id, { rating, comment });
        setEditingReview(null);
      } else {
        await onCreateReview({
          course_id: courseId,
          rating,
          comment,
        });
      }
      setIsWriting(false);
      setRating(5);
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-100">Avis des participants</h2>
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Number(averageRating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-dark-400'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-2xl font-bold text-dark-100">{averageRating}</span>
            <span className="ml-2 text-dark-400">({reviews.length} avis)</span>
          </div>
        </div>

        {user && !userReview && !isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="btn-primary flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Donner mon avis
          </button>
        )}
      </div>

      <AnimatePresence>
        {(isWriting || editingReview) && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="card p-6 space-y-4 overflow-hidden"
          >
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-dark-200 text-sm font-medium mb-2">
                Note
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-dark-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-dark-200 text-sm font-medium mb-2">
                Commentaire
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input w-full h-32 resize-none"
                placeholder="Partagez votre expérience..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsWriting(false);
                  setEditingReview(null);
                  setRating(5);
                  setComment('');
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                {editingReview ? 'Mettre à jour' : 'Publier'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {review.profiles?.avatar_url ? (
                  <img
                    src={review.profiles.avatar_url}
                    alt={review.profiles.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                    <User className="w-6 h-6 text-dark-400" />
                  </div>
                )}
                <div className="ml-4">
                  <div className="flex items-center">
                    <span className="font-medium text-dark-100">
                      {review.profiles?.username}
                    </span>
                    <span className="mx-2 text-dark-400">•</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-dark-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-dark-400">
                    {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>

              {user?.id === review.user_id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingReview(review);
                      setRating(review.rating);
                      setComment(review.comment);
                      setIsWriting(true);
                    }}
                    className="p-2 text-dark-400 hover:text-accent-500 rounded-lg hover:bg-dark-700/50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteReview(review.id)}
                    className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-dark-700/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {review.comment && (
              <p className="mt-4 text-dark-200 whitespace-pre-wrap">{review.comment}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CourseReviews;