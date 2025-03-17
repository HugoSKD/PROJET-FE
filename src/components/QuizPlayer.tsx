import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Quiz, QuizQuestion, QuizAttempt } from '../types/database';

interface QuizPlayerProps {
  quiz: Quiz;
  questions: QuizQuestion[];
  onComplete: (answers: Record<string, string>) => Promise<void>;
  previousAttempt?: QuizAttempt;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  questions,
  onComplete,
  previousAttempt,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (Object.keys(answers).length === questions.length) {
      setShowResults(true);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await onComplete(answers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setError('');
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {score >= 70 ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : score >= 40 ? (
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-dark-100">
            Score : {score}%
          </h2>
          
          <p className="text-dark-300">
            Vous avez répondu correctement à {questions.filter(q => answers[q.id] === q.correct_answer).length} questions sur {questions.length}.
          </p>

          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={handleRetry}
              className="btn-secondary flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réessayer
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary"
            >
              Terminer
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-100">{quiz.title}</h2>
        <div className="text-dark-400">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </div>
      </div>

      <div className="w-full bg-dark-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          className="bg-accent-500 h-2 rounded-full transition-all duration-300"
        />
      </div>

      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="card p-6"
      >
        <h3 className="text-xl font-semibold text-dark-100 mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.type === 'multiple_choice' ? (
            currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 rounded-lg border transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                    : 'bg-dark-700/50 border-dark-600 text-dark-200 hover:border-accent-500/30'
                }`}
              >
                {option}
              </button>
            ))
          ) : currentQuestion.type === 'true_false' ? (
            <div className="flex space-x-4">
              <button
                onClick={() => handleAnswer('true')}
                className={`flex-1 p-4 rounded-lg border transition-all ${
                  answers[currentQuestion.id] === 'true'
                    ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                    : 'bg-dark-700/50 border-dark-600 text-dark-200 hover:border-accent-500/30'
                }`}
              >
                Vrai
              </button>
              <button
                onClick={() => handleAnswer('false')}
                className={`flex-1 p-4 rounded-lg border transition-all ${
                  answers[currentQuestion.id] === 'false'
                    ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                    : 'bg-dark-700/50 border-dark-600 text-dark-200 hover:border-accent-500/30'
                }`}
              >
                Faux
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              className="input w-full"
              placeholder="Votre réponse..."
            />
          )}
        </div>

        {previousAttempt && (
          <div className="mt-4 p-4 rounded-lg bg-dark-700/50 border border-dark-600">
            <p className="text-dark-300 text-sm">
              Réponse précédente : {previousAttempt.answers[currentQuestion.id]}
            </p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            className="btn-primary flex items-center"
          >
            {isLastQuestion ? 'Voir les résultats' : 'Question suivante'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizPlayer;