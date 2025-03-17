import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Undo, Redo, Square, Circle, Triangle, Link as Line, Type, Image } from 'lucide-react';
import { Diagram } from '../types/database';

interface DiagramEditorProps {
  diagram: Diagram;
  onSave: (diagram: Diagram) => Promise<void>;
  isLoading?: boolean;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  url?: string;
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({
  diagram,
  onSave,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(diagram.title);
  const [description, setDescription] = useState(diagram.description || '');
  const [shapes, setShapes] = useState<Shape[]>(diagram.content.shapes || []);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [selectedTool, setSelectedTool] = useState<Shape['type'] | null>(null);
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [error, setError] = useState('');

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sauvegarder l'état actuel dans l'historique
    if (shapes.length > 0 && historyIndex < history.length - 1) {
      setHistory([...history.slice(0, historyIndex + 1), shapes]);
      setHistoryIndex(historyIndex + 1);
    }
  }, [shapes]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedTool || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newShape: Shape = {
      id: crypto.randomUUID(),
      type: selectedTool,
      x,
      y,
      width: 100,
      height: 100,
      style: {
        fill: '#4f46e5',
        stroke: '#ffffff',
        strokeWidth: 2,
      },
    };

    setShapes([...shapes, newShape]);
    setSelectedShape(newShape);
  };

  const handleShapeClick = (shape: Shape, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedShape(shape);
  };

  const handleShapeDrag = (shape: Shape, e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setShapes(shapes.map(s => 
      s.id === shape.id ? { ...s, x, y } : s
    ));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (!title) throw new Error('Le titre est requis');

      await onSave({
        ...diagram,
        title,
        description,
        content: { shapes },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const tools = [
    { type: 'rectangle', icon: Square },
    { type: 'circle', icon: Circle },
    { type: 'triangle', icon: Triangle },
    { type: 'line', icon: Line },
    { type: 'text', icon: Type },
    { type: 'image', icon: Image },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-100">Éditeur de schéma</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="btn-secondary"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="btn-secondary"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-dark-200 text-sm font-medium mb-2">
            Titre
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input w-full"
            placeholder="Titre du schéma"
          />
        </div>

        <div>
          <label className="block text-dark-200 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full h-24 resize-none"
            placeholder="Description du schéma"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        {tools.map(({ type, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setSelectedTool(type as Shape['type'])}
            className={`p-3 rounded-lg transition-all ${
              selectedTool === type
                ? 'bg-accent-500 text-white'
                : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
            }`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="card aspect-video relative overflow-hidden bg-dark-700"
      >
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute cursor-move ${
              selectedShape?.id === shape.id ? 'ring-2 ring-accent-500' : ''
            }`}
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
            }}
            onClick={(e) => handleShapeClick(shape, e)}
            drag
            onDrag={(e) => handleShapeDrag(shape, e as any)}
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
            {/* Ajouter d'autres types de formes ici */}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DiagramEditor;