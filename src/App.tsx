import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseForm from './pages/CourseForm';
import Resources from './pages/Resources';
import Forum from './pages/Forum';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import AuthModal from './components/AuthModal';
import Notifications from './components/Notifications';
import { useAuthStore } from './store/authStore';
import { useGlobalStore } from './store/globalStore';

const ProtectedRoute = ({ children, adminOnly = false, requireVerified = true }: { 
  children: React.ReactNode, 
  adminOnly?: boolean,
  requireVerified?: boolean 
}) => {
  const { user, profile } = useAuthStore();
  const { addNotification } = useGlobalStore();
  
  useEffect(() => {
    if (!user) {
      addNotification({
        type: 'error',
        message: 'Vous devez être connecté pour accéder à cette page',
        duration: 3000,
      });
    } else if (adminOnly && profile?.role !== 'admin') {
      addNotification({
        type: 'error',
        message: 'Accès réservé aux administrateurs',
        duration: 3000,
      });
    } else if (requireVerified && !user.email_confirmed_at) {
      addNotification({
        type: 'error',
        message: 'Veuillez vérifier votre email pour accéder à cette page',
        duration: 3000,
      });
    }
  }, [user, profile]);
  
  if (!user || (adminOnly && profile?.role !== 'admin') || (requireVerified && !user.email_confirmed_at)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'signin' | 'signup';
  }>({
    isOpen: false,
    mode: 'signin',
  });

  const { checkAuth } = useAuthStore();
  const { isDarkMode } = useGlobalStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
        <Navbar
          onSignIn={() => setAuthModal({ isOpen: true, mode: 'signin' })}
          onSignUp={() => setAuthModal({ isOpen: true, mode: 'signup' })}
        />
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Features />
                </>
              }
            />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route
              path="/courses/new"
              element={
                <ProtectedRoute>
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id/edit"
              element={
                <ProtectedRoute>
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route path="/resources" element={<Resources />} />
            <Route path="/forum" element={<Forum />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireVerified={false}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute requireVerified={false}>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
        <AuthModal
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        />
        <Notifications />
      </div>
    </Router>
  );
}

export default App;