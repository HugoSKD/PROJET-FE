import React from 'react';
import { motion } from 'framer-motion';
import { Badge, UserBadge } from '../types/database';

interface BadgeListProps {
  badges: Badge[];
  userBadges: UserBadge[];
  className?: string;
}

const BadgeList: React.FC<BadgeListProps> = ({
  badges,
  userBadges,
  className = '',
}) => {
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${className}`}>
      {badges.map((badge) => {
        const isEarned = earnedBadgeIds.has(badge.id);
        const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
        
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`card p-4 text-center ${
              isEarned
                ? 'bg-accent-500/10 border-accent-500'
                : 'opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">{badge.icon}</div>
            <h3 className="text-lg font-semibold text-dark-100 mb-1">
              {badge.name}
            </h3>
            <p className="text-sm text-dark-400">
              {badge.description}
            </p>
            {isEarned && userBadge && (
              <div className="mt-2 text-xs text-accent-400">
                Obtenu le {new Date(userBadge.earned_at).toLocaleDateString()}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default BadgeList;