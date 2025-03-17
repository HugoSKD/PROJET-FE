import React from 'react';
import { motion } from 'framer-motion';
import { Diagram } from '../types/database';

interface DiagramViewerProps {
  diagram: Diagram;
}

const DiagramViewer: React.FC<DiagramViewerProps> = ({ diagram }) => {
  const shapes = diagram.content.shapes || [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-dark-100">{diagram.title}</h3>
          {diagram.description && (
            <p className="mt-1 text-dark-300">{diagram.description}</p>
          )}
        </div>
      </div>

      <div className="card aspect-video relative overflow-hidden bg-dark-700">
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute pointer-events-none"
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
            }}
          >
            {shape.type === 'rectangle' && (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: shape.style?.fill,
                  border: `${shape.style?.strokeWidth}px solid ${shape.style?.stroke}`,
                }}
              />
            )}
            {shape.type === 'circle' && (
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: shape.style?.fill,
                  border: `${shape.style?.strokeWidth}px solid ${shape.style?.stroke}`,
                }}
              />
            )}
            {shape.type === 'triangle' && (
              <div
                className="w-full h-full"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  backgroundColor: shape.style?.fill,
                  border: `${shape.style?.strokeWidth}px solid ${shape.style?.stroke}`,
                }}
              />
            )}
            {shape.type === 'text' && (
              <div
                className="w-full h-full flex items-center justify-center text-dark-100"
                style={{
                  color: shape.style?.fill,
                }}
              >
                {shape.text}
              </div>
            )}
            {shape.type === 'image' && shape.url && (
              <img
                src={shape.url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            {shape.type === 'line' && (
              <div
                className="absolute"
                style={{
                  width: '2px',
                  height: '100%',
                  backgroundColor: shape.style?.stroke,
                  transform: 'rotate(45deg)',
                  transformOrigin: 'top left',
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DiagramViewer;