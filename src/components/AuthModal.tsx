import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Check, AlertCircle, Eye, EyeOff, Github, Chrome } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import LoadingDots from './LoadingDots';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode: initialMode }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInWithGithub } = useAuthStore();

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Update password validation on change
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [password]);

  // Update mode when initialMode prop changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setError('');
    setIsLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!username) {
          throw new Error('Le pseudo est requis');
        }
        if (username.length < 3) {
          throw new Error('Le pseudo doit contenir au moins 3 caractères');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          throw new Error('Le pseudo ne peut contenir que des lettres, chiffres et underscores');
        }
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        if (!Object.values(passwordValidation).every(Boolean)) {
          throw new Error('Le mot de passe ne respecte pas les critères requis');
        }
        await signUp(email, password, username);
        handleClose();
      } else {
        await signIn(email, password);
        handleClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setError('');
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithGithub();
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue avec l\'authentification');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  const ValidationCheck = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-400' : 'text-dark-400'}`}>
      {isValid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-dark-800 rounded-lg p-6 w-full max-w-md relative border border-dark-700 my-8"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-dark-400 hover:text-dark-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-2xl font-bold text-dark-100 mb-4">
            {mode === 'signin' ? 'Connexion' : 'Inscription'}
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded mb-4"
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              className="btn-secondary flex items-center justify-center space-x-2 py-2"
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5" />
              <span>Continuer avec Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialAuth('github')}
              className="btn-secondary flex items-center justify-center space-x-2 py-2"
              disabled={isLoading}
            >
              <Github className="w-5 h-5" />
              <span>Continuer avec GitHub</span>
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-800 text-dark-400">Ou</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-dark-200 text-sm font-medium mb-1">
                  Pseudo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="input w-full pl-10"
                    placeholder="votre_pseudo"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-dark-200 text-sm font-medium mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full pl-10"
                  placeholder="votre@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-dark-200 text-sm font-medium mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-1">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input w-full pl-10 pr-10"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-dark-700/50 p-3 rounded-lg space-y-1.5">
                  <h3 className="text-sm font-medium text-dark-200 mb-2">
                    Le mot de passe doit contenir :
                  </h3>
                  <ValidationCheck isValid={passwordValidation.length} text="Au moins 8 caractères" />
                  <ValidationCheck isValid={passwordValidation.uppercase} text="Une lettre majuscule" />
                  <ValidationCheck isValid={passwordValidation.lowercase} text="Une lettre minuscule" />
                  <ValidationCheck isValid={passwordValidation.number} text="Un chiffre" />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center h-10 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingDots />
              ) : (
                mode === 'signin' ? 'Se connecter' : 'S\'inscrire'
              )}
            </button>

            <button
              type="button"
              onClick={toggleMode}
              className="w-full text-center text-dark-400 hover:text-dark-200 text-sm transition-colors"
            >
              {mode === 'signin' 
                ? 'Pas encore de compte ? Inscrivez-vous'
                : 'Déjà un compte ? Connectez-vous'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;