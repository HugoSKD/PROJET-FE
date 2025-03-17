import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare,
  Plus,
  Search,
  Filter,
  Pin,
  Lock,
  Clock,
  Eye,
  MessageCircle,
  Tag,
  X
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForumStore } from '../store/forumStore';
import { useAuthStore } from '../store/authStore';
import { ForumCategory, ForumTopic } from '../types/database';

const Forum = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    categories,
    topics,
    loading,
    error,
    fetchCategories,
    fetchTopics
  } = useForumStore();

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'replies'>('recent');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTopics();
  }, []);

  const filteredTopics = React.useMemo(() => {
    let result = [...topics];

    // Filter by category
    if (selectedCategory) {
      result = result.filter(topic => topic.category_id === selectedCategory);
    }

    // Filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        topic =>
          topic.title.toLowerCase().includes(searchLower) ||
          topic.content.toLowerCase().includes(searchLower)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter(topic =>
        selectedTags.every(tag => topic.tags.includes(tag))
      );
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.last_post_at).getTime() - new Date(a.last_post_at).getTime());
        break;
      case 'views':
        result.sort((a, b) => b.views_count - a.views_count);
        break;
      case 'replies':
        result.sort((a, b) => b.posts_count - a.posts_count);
        break;
    }

    return result;
  }, [topics, selectedCategory, searchTerm, selectedTags, sortBy]);

  const CategoryCard = ({ category }: { category: ForumCategory }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedCategory(category.id)}
      className={`card p-6 cursor-pointer transition-all ${
        selectedCategory === category.id
          ? 'border-accent-500 bg-accent-500/5'
          : 'hover:border-accent-500/30'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
          {category.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-dark-100">{category.name}</h3>
          <p className="text-dark-400 text-sm">{category.description}</p>
        </div>
      </div>
    </motion.div>
  );

  const TopicCard = ({ topic }: { topic: ForumTopic }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/forum/topics/${topic.id}`)}
      className="card p-6 cursor-pointer hover:border-accent-500/30"
    >
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {topic.is_pinned && (
              <Pin className="w-4 h-4 text-accent-500" />
            )}
            {topic.is_locked && (
              <Lock className="w-4 h-4 text-red-500" />
            )}
            <h3 className="text-lg font-semibold text-dark-100">{topic.title}</h3>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-dark-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(topic.last_post_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {topic.views_count}
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {topic.posts_count}
            </div>
          </div>

          {topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {topic.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-accent-500/10 text-accent-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="ml-6 flex flex-col items-end justify-between">
          <div className="flex items-center text-sm text-dark-400">
            <img
              src={topic.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + topic.author?.username}
              alt={topic.author?.username}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span>{topic.author?.username}</span>
          </div>
          
          {topic.last_post_user && topic.last_post_user.username !== topic.author?.username && (
            <div className="text-xs text-dark-400 mt-2">
              Dernière réponse par {topic.last_post_user.username}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (error) {
    return (
      <AnimatedPage>
        <div className="min-h-screen py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
              Une erreur est survenue lors du chargement du forum.
            </div>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-dark-100">Forum</h1>
              <p className="mt-2 text-dark-400">
                Échangez avec la communauté sur vos questions financières
              </p>
            </div>
            
            {user && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNewTopicModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau sujet
              </motion.button>
            )}
          </div>

          {/* Search and filters */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher dans le forum..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center ${
                  showFilters ? 'bg-accent-500 text-white hover:bg-accent-600' : ''
                }`}
              >
                {showFilters ? (
                  <X className="w-5 h-5 mr-2" />
                ) : (
                  <Filter className="w-5 h-5 mr-2" />
                )}
                Filtres
              </button>
            </div>

            <motion.div
              initial={false}
              animate={{
                height: showFilters ? 'auto' : 0,
                opacity: showFilters ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    Trier par
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSortBy('recent')}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        sortBy === 'recent'
                          ? 'bg-accent-500 text-white'
                          : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                      }`}
                    >
                      Plus récents
                    </button>
                    <button
                      onClick={() => setSortBy('views')}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        sortBy === 'views'
                          ? 'bg-accent-500 text-white'
                          : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                      }`}
                    >
                      Plus vus
                    </button>
                    <button
                      onClick={() => setSortBy('replies')}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        sortBy === 'replies'
                          ? 'bg-accent-500 text-white'
                          : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                      }`}
                    >
                      Plus de réponses
                    </button>
                  </div>
                </div>

                {selectedTags.length > 0 && (
                  <div>
                    <label className="block text-dark-200 text-sm font-medium mb-2">
                      Tags sélectionnés
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTags(tags => tags.filter(t => t !== tag))}
                          className="px-3 py-1 rounded-full text-sm bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 flex items-center"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                          <X className="w-3 h-3 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Chargement du forum..." />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>

              {/* Topics */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-dark-100">
                    {selectedCategory
                      ? `Sujets dans ${categories.find(c => c.id === selectedCategory)?.name}`
                      : 'Tous les sujets'}
                  </h2>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-dark-400 hover:text-dark-200"
                    >
                      Voir tous les sujets
                    </button>
                  )}
                </div>

                {filteredTopics.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTopics.map(topic => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-dark-400 mx-auto mb-4" />
                    <p className="text-dark-400">
                      Aucun sujet ne correspond à vos critères.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Forum;