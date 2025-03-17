import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Section } from '../types/database';
import { useDiagramStore } from '../store/diagramStore';
import { useQuizStore } from '../store/quizStore';
import DiagramViewer from './DiagramViewer';
import QuizPlayer from './QuizPlayer';

interface SectionContentProps {
  section: Section;
  onComplete: () => void;
  isCompleted: boolean;
}

const SectionContent: React.FC<SectionContentProps> = ({
  section,
  onComplete,
  isCompleted,
}) => {
  const { diagrams } = useDiagramStore();
  const { quizzes, questions, attempts, fetchQuizzes, fetchQuestions, fetchAttempts, submitAttempt } = useQuizStore();

  React.useEffect(() => {
    fetchQuizzes(section.id);
  }, [section.id]);

  React.useEffect(() => {
    if (quizzes.length > 0) {
      quizzes.forEach(quiz => {
        fetchQuestions(quiz.id);
        fetchAttempts(quiz.id);
      });
    }
  }, [quizzes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>

      {diagrams.length > 0 && (
        <div className="space-y-8 my-8">
          {diagrams.map((diagram) => (
            <DiagramViewer key={diagram.id} diagram={diagram} />
          ))}
        </div>
      )}

      {quizzes.length > 0 && (
        <div className="space-y-8 my-8">
          {quizzes.map((quiz) => {
            const quizQuestions = questions.filter(q => q.quiz_id === quiz.id);
            const latestAttempt = attempts.find(a => a.quiz_id === quiz.id);
            
            if (quizQuestions.length === 0) return null;
            
            return (
              <QuizPlayer
                key={quiz.id}
                quiz={quiz}
                questions={quizQuestions}
                onComplete={(answers) => submitAttempt(quiz.id, answers)}
                previousAttempt={latestAttempt}
              />
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-6 border-t border-dark-700">
        <button
          onClick={onComplete}
          className={`btn-primary ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {isCompleted ? 'Section terminée ✓' : 'Marquer comme terminée'}
        </button>
      </div>
    </motion.div>
  );
};

export default SectionContent;