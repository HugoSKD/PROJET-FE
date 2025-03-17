import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, UserCircle, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

interface NavbarProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSignIn, onSignUp }) => {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      if (location.pathname === '/profile') {
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { to: '/', label: 'Accueil' },
    { to: '/courses', label: 'Cours' },
    { to: '/resources', label: 'Ressources' },
    { to: '/forum', label: 'Forum' },
  ];

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <TrendingUp className="h-8 w-8 text-accent-500 group-hover:text-accent-400 transition-colors" />
              </motion.div>
              <span className="ml-2 text-xl font-semibold text-dark-100 group-hover:text-accent-500 transition-colors">
                FinanceEdu
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.to
                    ? 'text-accent-500 bg-accent-500/10'
                    : 'text-dark-100 hover:text-accent-500 hover:bg-dark-700/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                  location.pathname === '/admin'
                    ? 'text-accent-500 bg-accent-500/10'
                    : 'text-dark-100 hover:text-accent-500 hover:bg-dark-700/50'
                }`}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center">
                <motion.button
                  onClick={handleProfileClick}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-all duration-200 ${
                    location.pathname === '/profile'
                      ? 'bg-accent-500/10 text-accent-500'
                      : 'text-dark-200 hover:text-accent-500 hover:bg-dark-700/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-accent-500/20"
                    />
                  ) : (
                    <UserCircle className="h-8 w-8" />
                  )}
                  <span className="text-sm font-medium">{profile?.username}</span>
                </motion.button>

                <motion.button
                  onClick={handleSignOut}
                  className="ml-2 p-2 text-dark-400 hover:text-accent-500 rounded-md hover:bg-dark-700/50 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            ) : (
              <>
                <motion.button
                  onClick={onSignIn}
                  className="btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Connexion
                </motion.button>
                <motion.button
                  onClick={onSignUp}
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  S'inscrire
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;