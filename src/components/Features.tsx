import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Users, Shield, Target, Brain, BarChart as ChartBar, Rocket } from 'lucide-react';

const features = [
  {
    name: 'Cours structurés',
    description: 'Des parcours d\'apprentissage adaptés à tous les niveaux, des débutants aux experts.',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Analyses de marché',
    description: 'Comprendre les tendances et les opportunités d\'investissement actuelles.',
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
  },
  {
    name: 'Communauté active',
    description: 'Échangez avec d\'autres apprenants et des experts financiers.',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Contenu vérifié',
    description: 'Des informations fiables et à jour, validées par des experts.',
    icon: Shield,
    color: 'from-red-500 to-red-600',
  },
  {
    name: 'Objectifs personnalisés',
    description: 'Définissez et suivez vos objectifs financiers personnels.',
    icon: Target,
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    name: 'Apprentissage adaptatif',
    description: 'Un parcours qui s\'adapte à votre rythme et à vos progrès.',
    icon: Brain,
    color: 'from-pink-500 to-pink-600',
  },
  {
    name: 'Outils pratiques',
    description: 'Des calculateurs et simulateurs pour mettre en pratique.',
    icon: ChartBar,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    name: 'Progression rapide',
    description: 'Atteignez vos objectifs financiers plus rapidement.',
    icon: Rocket,
    color: 'from-cyan-500 to-cyan-600',
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-dark-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(30deg,#4f46e5_12%,transparent_12.5%,transparent_87%,#4f46e5_87.5%,#4f46e5)] bg-[length:20px_20px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-base text-accent-500 font-semibold tracking-wide uppercase"
          >
            Fonctionnalités
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-4xl font-extrabold text-dark-100 sm:text-5xl"
          >
            Une approche complète de
            <br />
            l'éducation financière
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-xl text-dark-300"
          >
            Découvrez tous les outils nécessaires pour développer vos compétences financières
            et atteindre vos objectifs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 to-accent-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-8 rounded-2xl border border-dark-700 bg-dark-800/50 backdrop-blur-sm hover:border-accent-500/50 transition-colors duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-100 mb-3 group-hover:text-accent-500 transition-colors duration-300">
                  {feature.name}
                </h3>
                <p className="text-dark-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;