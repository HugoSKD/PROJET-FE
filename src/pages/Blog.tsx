import React from 'react';
import { Calendar } from 'lucide-react';

const posts = [
  {
    id: 1,
    title: 'Comment débuter en bourse en 2025',
    excerpt: 'Un guide complet pour commencer à investir en bourse avec un petit capital.',
    date: '15 Mars 2025',
    author: 'Sophie Martin',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 2,
    title: 'Les meilleures stratégies d\'épargne',
    excerpt: 'Découvrez les techniques les plus efficaces pour optimiser votre épargne.',
    date: '12 Mars 2025',
    author: 'Thomas Dubois',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  },
];

const Blog = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Blog Finance
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Les dernières actualités et conseils financiers
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                className="h-48 w-full object-cover"
                src={post.image}
                alt={post.title}
              />
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {post.date}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Par {post.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;