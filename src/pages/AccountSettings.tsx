import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AnimatedPage from '../components/AnimatedPage';
import LoadingSpinner from '../components/LoadingSpinner';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, updateEmail, updatePassword, deleteAccount, loading, error } = useAuthStore();

  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [success, setSuccess] = useState('');

  // Form states
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');

  if (!user || !profile) {
    navigate('/');
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ username, bio });
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmail(email);
      setSuccess('Un email de confirmation a été envoyé à votre nouvelle adresse');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    try {
      await updatePassword(newPassword);
      setSuccess('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const sections = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'password', icon: Lock, label: 'Mot de passe' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Sécurité' },
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-dark-100 mb-8">
            Paramètres du compte
          </h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-64">
              <div className="card p-4">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-accent-600 text-white'
                          : 'text-dark-200 hover:bg-dark-700'
                      }`}
                    >
                      <section.icon className="w-5 h-5 mr-3" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="card p-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded mb-6"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded mb-6 flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {success}
                  </motion.div>
                )}

                {activeSection === 'profile' && (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-dark-200 text-sm font-medium mb-2">
                        Pseudo
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-dark-200 text-sm font-medium mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="input w-full h-32 resize-none"
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Enregistrer'}
                    </button>
                  </form>
                )}

                {activeSection === 'email' && (
                  <form onSubmit={handleUpdateEmail} className="space-y-6">
                    <div>
                      <label className="block text-dark-200 text-sm font-medium mb-2">
                        Nouvelle adresse email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Mettre à jour'}
                    </button>
                  </form>
                )}

                {activeSection === 'password' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                      <label className="block text-dark-200 text-sm font-medium mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-dark-200 text-sm font-medium mb-2">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || newPassword !== confirmPassword}
                      className="btn-primary"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Mettre à jour'}
                    </button>
                  </form>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-dark-100">
                      Préférences de notification
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-dark-200">
                          Notifications par email
                        </label>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-dark-700">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-dark-200">
                          Notifications du forum
                        </label>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-dark-700">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'security' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-dark-100 mb-4">
                        Supprimer le compte
                      </h3>
                      <p className="text-dark-400 mb-4">
                        Cette action est irréversible et supprimera toutes vos données.
                      </p>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="btn-secondary bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer mon compte
                        </button>
                      ) : (
                        <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
                          <div className="flex items-start mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-1" />
                            <p className="text-red-400">
                              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
                            </p>
                          </div>
                          <div className="flex space-x-4">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={loading}
                              className="btn-secondary bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-700"
                            >
                              {loading ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                'Confirmer la suppression'
                              )}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="btn-secondary"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AccountSettings;