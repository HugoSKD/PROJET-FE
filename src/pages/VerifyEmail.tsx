import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AnimatedPage from '../components/AnimatedPage';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, verifyEmail, resendVerificationEmail, loading, error } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleVerification(token);
    }
  }, [searchParams]);

  const handleVerification = async (token: string) => {
    try {
      await verifyEmail(token);
      setVerificationStatus('success');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setVerificationStatus('error');
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationEmail();
      setVerificationStatus('pending');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {loading ? (
            <LoadingSpinner size="lg" text="Vérification en cours..." />
          ) : verificationStatus === 'success' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-dark-100">
                Email vérifié avec succès !
              </h2>
              <p className="text-dark-400">
                Vous allez être redirigé vers la page d'accueil...
              </p>
            </motion.div>
          ) : verificationStatus === 'error' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-dark-100">
                Erreur de vérification
              </h2>
              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <button
                onClick={handleResend}
                disabled={loading}
                className="btn-primary flex items-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Renvoyer l'email
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-dark-100">
                Vérifiez votre email
              </h2>
              <p className="text-dark-400">
                Un email de vérification a été envoyé à {user?.email}.<br />
                Cliquez sur le lien dans l'email pour vérifier votre compte.
              </p>
              <button
                onClick={handleResend}
                disabled={loading}
                className="btn-primary flex items-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Renvoyer l'email
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default VerifyEmail;