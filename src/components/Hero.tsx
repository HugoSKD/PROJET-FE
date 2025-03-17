import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BookOpen, Users, ChevronRight, Shield, Target, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Hero = () => {
  const { user } = useAuthStore();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = [
    { text: 'Gagner', color: 'from-green-400 to-green-600' },
    { text: 'Dépenser', color: 'from-blue-400 to-blue-600' },
    { text: 'Investir', color: 'from-purple-400 to-purple-600' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 5000); // Increased from 3000 to 5000ms
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Apprenants', value: '10,000+', description: 'Rejoignez notre communauté active' },
    { label: 'Cours', value: '50+', description: 'Des contenus de qualité' },
    { label: 'Satisfaction', value: '98%', description: 'Avis positifs des utilisateurs' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          className="w-full h-full"
        >
          <img
            src="https://images.unsplash.com/photo-1642790551116-18e150f248e3?auto=format&fit=crop&q=80"
            alt="Finance background"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/95 to-dark-900/80" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 mb-6"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">La plateforme d'éducation financière N°1</span>
            </motion.div>

            <div className="relative h-[320px] mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight">
                    <span className={`bg-gradient-to-r ${words[currentWordIndex].color} text-transparent bg-clip-text`}>
                      {words[currentWordIndex].text}
                    </span>
                    <br />
                    <span className="text-4xl sm:text-5xl lg:text-6xl text-white mt-4 block">
                      de l'argent
                      <br />
                      ça s'apprend.
                    </span>
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-dark-200 mb-8 max-w-lg leading-relaxed"
            >
              Découvrez notre plateforme complète d'apprentissage financier. Des cours structurés,
              des ressources expertes et une communauté active pour vous accompagner vers la réussite financière.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/courses"
                className="btn-primary flex items-center justify-center group text-lg px-8 py-4"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Commencer gratuitement
                <ChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/forum"
                className="btn-secondary flex items-center justify-center group text-lg px-8 py-4"
              >
                <Users className="w-5 h-5 mr-2" />
                Rejoindre la communauté
                <ChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 grid grid-cols-3 gap-8 border-t border-dark-700 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-accent-500 mb-2">{stat.value}</div>
                  <div className="text-lg font-medium text-dark-200 mb-1">{stat.label}</div>
                  <div className="text-sm text-dark-400">{stat.description}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl transform rotate-6 blur-xl opacity-20" />
            <div className="relative bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-xl">
              <div className="aspect-[4/3] rounded-lg overflow-hidden mb-6">
                <img
                  src="https://images.unsplash.com/photo-1642790551116-18e150f248e3?auto=format&fit=crop&q=80"
                  alt="Trading dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-dark-700/50 rounded-lg">
                  <Target className="w-8 h-8 text-accent-500" />
                  <div>
                    <h3 className="font-semibold text-dark-100">Objectifs clairs</h3>
                    <p className="text-dark-400">Suivez votre progression pas à pas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-dark-700/50 rounded-lg">
                  <Shield className="w-8 h-8 text-accent-500" />
                  <div>
                    <h3 className="font-semibold text-dark-100">Contenu vérifié</h3>
                    <p className="text-dark-400">Par des experts du domaine</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-dark-700/50 rounded-lg">
                  <Brain className="w-8 h-8 text-accent-500" />
                  <div>
                    <h3 className="font-semibold text-dark-100">Apprentissage adapté</h3>
                    <p className="text-dark-400">À votre rythme et niveau</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;