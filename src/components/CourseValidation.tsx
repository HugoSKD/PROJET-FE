import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Course } from '../types/database';

interface CourseValidationProps {
  course: Course;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const CourseValidation: React.FC<CourseValidationProps> = ({
  course,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleApprove = async () => {
    try {
      await onApprove();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        throw new Error('La raison du refus est requise');
      }
      await onReject(rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-100">Validation du cours</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approuver
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isLoading}
            className="btn-secondary bg-red-900/20 text-red-400 border-red-700 flex items-center"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Refuser
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-dark-100">{course.title}</h3>
            <p className="text-dark-400">
              Soumis le {format(new Date(course.created_at), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="flex items-center text-yellow-500">
            <AlertTriangle className="w-5 h-5 mr-2" />
            En attente de validation
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <p>{course.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-dark-300">
          <div>
            <span className="font-medium">Niveau :</span> {course.level}
          </div>
          <div>
            <span className="font-medium">Durée :</span> {course.duration} minutes
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRejectModal && (
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
              className="bg-dark-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-dark-700"
            >
              <h3 className="text-xl font-bold text-dark-100 mb-4">
                Refuser le cours
              </h3>
              <p className="text-dark-300 mb-4">
                Veuillez expliquer la raison du refus. Cette explication sera envoyée à l'auteur.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input w-full h-32 resize-none mb-4"
                placeholder="Raison du refus..."
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  className="btn-secondary bg-red-900/20 text-red-400 border-red-700"
                >
                  Confirmer le refus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseValidation;