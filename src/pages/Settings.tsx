import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Palette, 
  User,
  Mail,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useAuthStore } from '../store/authStore';

const Settings = () => {
  const { user, profile, updateProfile, deleteAccount } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // États pour les paramètres de notification
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [forumNotifs, setForumNotifs] = useState(true);
  const [courseNotifs, setCourseNotifs] = useState(true);

  // États pour les paramètres d'apparence
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('normal');

  if (!user || !profile) {
    navigate('/');
    return null;
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    setError('');
    try {
      await updateProfile({
        notification_preferences: {
          email: emailNotifs,
          forum: forumNotifs,
          courses: courseNotifs
        }
      });
      setSuccess('Préférences de notification mises à jour');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError('');
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'security', icon: Shield, label: 'Sécurité' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'appearance', icon: Palette, label: 'Apparence' },
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-64">
              <div className="card p-4">
                <h2 className="text-xl font-bold text-dark-100 flex items-center mb-6">
                  <SettingsIcon className="w-5 h-5 mr-2" />
                  Paramètres
                </h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-accent-600 text-white'
                          : 'text-dark-200 hover:bg-dark-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5 mr-3" />
                      {tab.label}
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
                    className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded mb-4"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded mb-4 flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {success}
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <div>
                    <h3 className="text-xl font-semibold text-dark-100 mb-6">Informations du profil</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                          Email
                        </label>
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-dark-400 mr-2" />
                          <span className="text-dark-200">{user.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                          Pseudo
                        </label>
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-dark-400 mr-2" />
                          <span className="text-dark-200">{profile.username}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/profile')}
                        className="btn-secondary"
                      >
                        Modifier le profil
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-xl font-semibold text-dark-100 mb-6">Sécurité du compte</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-dark-200 mb-4">Mot de passe</h4>
                        <button className="btn-secondary flex items-center">
                          <Lock className="w-4 h-4 mr-2" />
                          Changer le mot de passe
                        </button>
                      </div>
                      
                      <div className="border-t border-dark-700 pt-6">
                        <h4 className="text-lg font-medium text-dark-200 mb-4">Supprimer le compte</h4>
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
                                className="btn-secondary bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-700"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
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
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h3 className="text-xl font-semibold text-dark-100 mb-6">Préférences de notification</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-dark-200">Notifications par email</label>
                        <button
                          onClick={() => setEmailNotifs(!emailNotifs)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            emailNotifs ? 'bg-accent-600' : 'bg-dark-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              emailNotifs ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-dark-200">Notifications du forum</label>
                        <button
                          onClick={() => setForumNotifs(!forumNotifs)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            forumNotifs ? 'bg-accent-600' : 'bg-dark-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              forumNotifs ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-dark-200">Notifications des cours</label>
                        <button
                          onClick={() => setCourseNotifs(!courseNotifs)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            courseNotifs ? 'bg-accent-600' : 'bg-dark-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              courseNotifs ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={handleSaveNotifications}
                          className="btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Enregistrer les préférences'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div>
                    <h3 className="text-xl font-semibold text-dark-100 mb-6">Apparence</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                          Thème
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setTheme('dark')}
                            className={`p-4 rounded-lg border ${
                              theme === 'dark'
                                ? 'border-accent-500 bg-dark-700'
                                : 'border-dark-700 hover:border-dark-600'
                            }`}
                          >
                            <div className="h-12 bg-dark-900 rounded mb-2" />
                            <span className="text-dark-200">Sombre</span>
                          </button>
                          <button
                            onClick={() => setTheme('light')}
                            className={`p-4 rounded-lg border ${
                              theme === 'light'
                                ? 'border-accent-500 bg-dark-700'
                                : 'border-dark-700 hover:border-dark-600'
                            }`}
                          >
                            <div className="h-12 bg-white rounded mb-2" />
                            <span className="text-dark-200">Clair</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                          Taille du texte
                        </label>
                        <select
                          value={fontSize}
                          onChange={(e) => setFontSize(e.target.value)}
                          className="input w-full"
                        >
                          <option value="small">Petit</option>
                          <option value="normal">Normal</option>
                          <option value="large">Grand</option>
                        </select>
                      </div>

                      <button className="btn-primary">
                        Appliquer les changements
                      </button>
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

export default Settings;