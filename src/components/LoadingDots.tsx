import React from 'react';
import { motion } from 'framer-motion';

interface LoadingDotsProps {
  color?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ color = 'text-accent-500' }) => {
  return (
    <div className="loading-dots">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${color}`}
          style={{ '--dot-index': i } as React.CSSProperties}
          initial={{ scale: 0.5, opacity: 0.3 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.16,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;