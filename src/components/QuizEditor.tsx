import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Trash2, GripVertical, Save, Edit2 } from 'lucide-react';
import { Quiz, QuizQuestion } from '../types/database';

interface QuizEditorProps {
  quiz: Quiz;
  questions: QuizQuestion[];
  onSave: (quiz: Quiz, questions: QuizQuestion[]) => Promise<void>;
  isLoading?: boolean;
}

const QuizEditor: React.FC<QuizEditorProps> = ({
  quiz,
  questions,
  onSave,
  isLoading = false,
}) => {
  const [editedQuiz, setEditedQuiz] = useState(quiz);
  const [editedQuestions, setEditedQuestions] = useState(questions);
  const [error, setError] = useState('');

  const handleQuizChange = (field: keyof Quiz, value: any) => {
    setEditedQuiz({ ...editedQuiz, [field]: value });
  };

  const handleAddQuestion = () => {
    const newQuestion: Partial<QuizQuestion> = {
      quiz_id: quiz.id,
      question: '',
      type: 'multiple_choice',
      options: ['Option 1', 'Option 2'],
      correct_answer: '',
      explanation: '',
      order_index: editedQuestions.length,
    };
    setEditedQuestions([...editedQuestions, newQuestion as QuizQuestion]);
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...editedQuestions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setEditedQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setEditedQuestions(editedQuestions.filter((_, i) => i !== index));
  };

  const handleAddOption = (questionIndex: number) => {
    const question = editedQuestions[questionIndex];
    if (question.type === 'multiple_choice') {
      const options = [...(question.options as string[]), `Option ${question.options?.length + 1}`];
      handleQuestionChange(questionIndex, 'options', options);
    }
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const question = editedQuestions[questionIndex];
    if (question.type === 'multiple_choice') {
      const options = [...(question.options as string[])];
      options[optionIndex] = value;
      handleQuestionChange(questionIndex, 'options', options);
    }
  };

  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const question = editedQuestions[questionIndex];
    if (question.type === 'multiple_choice') {
      const options = (question.options as string[]).filter((_, i) => i !== optionIndex);
      handleQuestionChange(questionIndex, 'options', options);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(editedQuestions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditedQuestions(items.map((item, index) => ({ ...item, order_index: index })));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validation
      if (!editedQuiz.title) throw new Error('Le titre du quiz est requis');
      
      for (const question of editedQuestions) {
        if (!question.question) throw new Error('Toutes les questions doivent avoir un énoncé');
        if (!question.correct_answer) throw new Error('Toutes les questions doivent avoir une réponse correcte');
        if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
          throw new Error('Les questions à choix multiples doivent avoir au moins 2 options');
        }
      }

      await onSave(editedQuiz, editedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-100">Éditeur de Quiz</h2>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-dark-200 text-sm font-medium mb-2">
            Titre du quiz
          </label>
          <input
            type="text"
            value={editedQuiz.title}
            onChange={(e) => handleQuizChange('title', e.target.value)}
            className="input w-full"
            placeholder="Titre du quiz"
          />
        </div>

        <div>
          <label className="block text-dark-200 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={editedQuiz.description || ''}
            onChange={(e) => handleQuizChange('description', e.target.value)}
            className="input w-full h-24 resize-none"
            placeholder="Description du quiz"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-dark-100">Questions</h3>
        <button
          onClick={handleAddQuestion}
          className="btn-secondary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une question
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {editedQuestions.map((question, index) => (
                <Draggable
                  key={index}
                  draggableId={`question-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="card p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center flex-1">
                          <div {...provided.dragHandleProps} className="cursor-move text-dark-400 hover:text-dark-200">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                            className="input flex-1 ml-2"
                            placeholder="Question"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-2 text-dark-400 hover:text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-dark-200 text-sm font-medium mb-2">
                            Type de question
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                            className="input w-full"
                          >
                            <option value="multiple_choice">Choix multiple</option>
                            <option value="true_false">Vrai/Faux</option>
                            <option value="open">Question ouverte</option>
                          </select>
                        </div>

                        {question.type === 'multiple_choice' && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-dark-200 text-sm font-medium">
                                Options
                              </label>
                              <button
                                onClick={() => handleAddOption(index)}
                                className="text-sm text-accent-500 hover:text-accent-400"
                              >
                                + Ajouter une option
                              </button>
                            </div>
                            <div className="space-y-2">
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                    className="input flex-1"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <button
                                    onClick={() => handleDeleteOption(index, optionIndex)}
                                    className="p-1 text-dark-400 hover:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-dark-200 text-sm font-medium mb-2">
                            Réponse correcte
                          </label>
                          {question.type === 'multiple_choice' ? (
                            <select
                              value={question.correct_answer}
                              onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                              className="input w-full"
                            >
                              <option value="">Sélectionner la bonne réponse</option>
                              {question.options?.map((option, optionIndex) => (
                                <option key={optionIndex} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : question.type === 'true_false' ? (
                            <select
                              value={question.correct_answer}
                              onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                              className="input w-full"
                            >
                              <option value="true">Vrai</option>
                              <option value="false">Faux</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={question.correct_answer}
                              onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                              className="input w-full"
                              placeholder="Réponse correcte"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-dark-200 text-sm font-medium mb-2">
                            Explication
                          </label>
                          <textarea
                            value={question.explanation || ''}
                            onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                            className="input w-full h-24 resize-none"
                            placeholder="Explication de la réponse"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default QuizEditor;