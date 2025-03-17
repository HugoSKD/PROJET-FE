import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {
  User,
  Mail,
  Edit2,
  Camera,
  Github,
  Chrome,
  Lock,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Upload
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, updateEmail, updatePassword, updateAvatar, deleteAccount } = useAuthStore();
  
  // States for different sections
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Form states
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Image handling states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropper, setCropper] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !profile) {
    navigate('/');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setShowAvatarModal(true);
    }
  };

  const handleCropComplete = async () => {
    if (!cropper) return;

    try {
      setIsLoading(true);
      const canvas = cropper.getCroppedCanvas();
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/avatar.jpg`, file, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.id}/avatar.jpg`);

      await updateAvatar(publicUrl);
      setShowAvatarModal(false);
      setSuccess('Photo de profil mise à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await updateProfile({ username, bio });
      setIsEditing(false);
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await updateEmail(email);
      setSuccess('Email mis à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Mot de passe mis à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  const sections = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'security', icon: Lock, label: 'Sécurité' },
    { id: 'connections', icon: Github, label: 'Connexions' },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-800 rounded-lg shadow-lg overflow-hidden">
          {/* En-tête du profil */}
          <div className="relative h-48 bg-gradient-to-r from-accent-600 to-accent-700">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-dark-800 border-4 border-dark-800 overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-dark-700">
                      <User className="w-16 h-16 text-dark-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-accent-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            {/* Messages de retour */}
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

            {/* Navigation des sections */}
            <div className="flex space-x-1 mb-6">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-accent-500 text-white'
                      : 'text-dark-200 hover:bg-dark-700'
                  }`}
                >
                  <section.icon className="w-5 h-5 mr-2" />
                  {section.label}
                </button>
              ))}
            </div>

            {/* Contenu des sections */}
            <div className="space-y-6">
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                          Pseudo
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="input w-full"
                          placeholder="Votre pseudo"
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

                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="btn-primary"
                        >
                          {isLoading ? <LoadingSpinner size="sm" /> : 'Enregistrer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setUsername(profile.username);
                            setBio(profile.bio || '');
                          }}
                          className="btn-secondary"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-dark-100">
                            {profile.username}
                          </h2>
                          <p className="text-dark-400 flex items-center mt-1">
                            <Mail className="w-4 h-4 mr-2" />
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn-secondary flex items-center"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Modifier le profil
                        </button>
                      </div>

                      <div className="prose prose-dark">
                        <h3 className="text-xl font-semibold text-dark-100 mb-2">Bio</h3>
                        <p className="text-dark-300">
                          {profile.bio || "Aucune bio n'a été ajoutée."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-8">
                  {/* Changement d'email */}
                  <div>
                    <h3 className="text-xl font-semibold text-dark-100 mb-4">
                      Changer d'email
                    </h3>
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                      <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                          Nouvel email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input w-full"
                          placeholder="nouvel@email.com"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? <LoadingSpinner size="sm" /> : 'Mettre à jour l\'email'}
                      </button>
                    </form>
                  </div>

                  {/* Changement de mot de passe */}
                  <div>
                    <h3 className="text-xl font-semibold text-dark-100 mb-4">
                      Changer de mot de passe
                    </h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input w-full"
                          placeholder="••••••••"
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
                          placeholder="••••••••"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? <LoadingSpinner size="sm" /> : 'Mettre à jour le mot de passe'}
                      </button>
                    </form>
                  </div>

                  {/* Suppression du compte */}
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
                            disabled={isLoading}
                            className="btn-secondary bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-700"
                          >
                            {isLoading ? (
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

              {activeSection === 'connections' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-dark-100 mb-4">
                    Comptes connectés
                  </h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => {}}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <Github className="w-6 h-6 mr-3" />
                        <div className="text-left">
                          <div className="font-medium text-dark-100">GitHub</div>
                          <div className="text-sm text-dark-400">Connectez votre compte GitHub</div>
                        </div>
                      </div>
                      <div className="text-dark-400">Non connecté</div>
                    </button>

                    <button
                      onClick={() => {}}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <Chrome className="w-6 h-6 mr-3" />
                        <div className="text-left">
                          <div className="font-medium text-dark-100">Google</div>
                          <div className="text-sm text-dark-400">Connectez votre compte Google</div>
                        </div>
                      </div>
                      <div className="text-dark-400">Non connecté</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de recadrage d'avatar */}
      <AnimatePresence>
        {showAvatarModal && avatarFile && (
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-dark-100">
                  Recadrer la photo
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="text-dark-400 hover:text-dark-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <Cropper
                src={URL.createObjectURL(avatarFile)}
                style={{ height: 400, width: '100%' }}
                aspectRatio={1}
                guides={false}
                onInitialized={(instance) => setCropper(instance)}
                className="mb-4"
              />

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCropComplete}
                  disabled={isLoading}
                  className="btn-primary flex items-center"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;