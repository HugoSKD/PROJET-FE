import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Bookmark, ThumbsUp, ThumbsDown, Star, Lightbulb, Target, Clock, X } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import LoadingSpinner from '../components/LoadingSpinner';
import ResourceFilters from '../components/ResourceFilters';
import { useResourceStore } from '../store/resourceStore';
import { useAuthStore } from '../store/authStore';
import { Resource, ResourceTag } from '../types/database';

const Resources = () => {
  const { user } = useAuthStore();
  const {
    resources,
    tags,
    userVotes,
    userBookmarks,
    loading,
    error,
    fetchResources,
    fetchTags,
    fetchUserVotes,
    fetchUserBookmarks,
    createResource,
    vote,
    toggleBookmark,
  } = useResourceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);

  // États pour le formulaire d'ajout de ressource
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    url: '',
    type: 'article',
    selectedTags: [] as string[]
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchResources();
    fetchTags();
    if (user) {
      fetchUserVotes();
      fetchUserBookmarks();
    }
  }, [user]);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (!newResource.title) throw new Error('Le titre est requis');
      if (!newResource.url) throw new Error("L'URL est requise");
      if (!newResource.type) throw new Error('Le type est requis');

      await createResource({
        title: newResource.title,
        description: newResource.description,
        url: newResource.url,
        type: newResource.type as Resource['type'],
        tags: newResource.selectedTags.map(id => ({ id })) as ResourceTag[],
      });

      setShowAddResource(false);
      setNewResource({
        title: '',
        description: '',
        url: '',
        type: 'article',
        selectedTags: []
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const filteredAndSortedResources = React.useMemo(() => {
    let result = [...resources];

    // Filtrage par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchLower) ||
          resource.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtrage par tags
    if (selectedTags.length > 0) {
      result = result.filter((resource) =>
        resource.tags?.some((tag) => selectedTags.includes(tag.id))
      );
    }

    // Tri
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.helpfulness_score - a.helpfulness_score);
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'rating':
        result.sort((a, b) => (b.votes_up - b.votes_down) - (a.votes_up - a.votes_down));
        break;
    }

    return result;
  }, [resources, searchTerm, selectedTags, sortBy]);

  const handleTagSelect = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (error) {
    return (
      <AnimatedPage>
        <div className="min-h-screen py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
              Une erreur est survenue lors du chargement des ressources.
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
              <h1 className="text-3xl font-bold text-dark-100">Ressources</h1>
              <p className="mt-2 text-dark-400">
                Découvrez et partagez des ressources pour approfondir vos connaissances
              </p>
            </div>
            {user && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddResource(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Proposer une ressource
              </motion.button>
            )}
          </div>

          <ResourceFilters
            tags={tags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Chargement des ressources..." />
            </div>
          ) : filteredAndSortedResources.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
            >
              {filteredAndSortedResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-dark-100">{resource.title}</h3>
                    {user && (
                      <button
                        onClick={() => toggleBookmark(resource.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          userBookmarks.has(resource.id)
                            ? 'text-accent-500 bg-accent-500/10'
                            : 'text-dark-400 hover:text-accent-500 hover:bg-dark-700/50'
                        }`}
                      >
                        <Bookmark className="w-5 h-5" fill={userBookmarks.has(resource.id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>

                  <p className="text-dark-300 mb-4">{resource.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          border: `1px solid ${tag.color}40`
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      Accéder à la ressource
                    </a>

                    {user && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => vote(resource.id, 'helpful')}
                          className={`p-2 rounded-lg transition-colors ${
                            userVotes[resource.id]?.some(v => v.vote_type === 'helpful')
                              ? 'text-green-500 bg-green-500/10'
                              : 'text-dark-400 hover:text-green-500 hover:bg-dark-700/50'
                          }`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => vote(resource.id, 'not_helpful')}
                          className={`p-2 rounded-lg transition-colors ${
                            userVotes[resource.id]?.some(v => v.vote_type === 'not_helpful')
                              ? 'text-red-500 bg-red-500/10'
                              : 'text-dark-400 hover:text-red-500 hover:bg-dark-700/50'
                          }`}
                        >
                          <ThumbsDown className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-dark-400 text-lg">
                Aucune ressource ne correspond à vos critères.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de ressource */}
      <AnimatePresence>
        {showAddResource && (
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark-100">Ajouter une ressource</h2>
                <button
                  onClick={() => setShowAddResource(false)}
                  className="text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded mb-4">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddResource} className="space-y-4">
                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="input w-full"
                    placeholder="Titre de la ressource"
                  />
                </div>

                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    className="input w-full h-32 resize-none"
                    placeholder="Description de la ressource"
                  />
                </div>

                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className="input w-full"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    Type
                  </label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className="input w-full"
                  >
                    <option value="article">Article</option>
                    <option value="video">Vidéo</option>
                    <option value="podcast">Podcast</option>
                    <option value="book">Livre</option>
                    <option value="tool">Outil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-dark-200 text-sm font-medium mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setNewResource({
                          ...newResource,
                          selectedTags: newResource.selectedTags.includes(tag.id)
                            ? newResource.selectedTags.filter(id => id !== tag.id)
                            : [...newResource.selectedTags, tag.id]
                        })}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          newResource.selectedTags.includes(tag.id)
                            ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                            : 'bg-dark-700/50 text-dark-300 border border-dark-600 hover:border-accent-500/30'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddResource(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Ajouter
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default Resources;