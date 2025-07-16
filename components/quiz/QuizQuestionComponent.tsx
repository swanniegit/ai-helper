'use client';

import React from 'react';
import { QuizQuestion } from '../../types/quiz';

interface QuizQuestionComponentProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  selectedAnswer?: string;
  timeRemaining: number;
}

const QuizQuestionComponent: React.FC<QuizQuestionComponentProps> = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  selectedAnswer,
  timeRemaining
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Question {questionIndex + 1} of {totalQuestions}
        </div>
        <div className="text-sm text-gray-500">
          Time remaining: {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {question.question_text}
        </h2>

        {/* Code Snippet (if available) */}
        {question.code_snippet && (
          <div className="mb-4">
            <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{question.code_snippet}</code>
            </pre>
          </div>
        )}

        {/* Question Type Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {question.question_type.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Answer Options */}
      {question.question_type === 'multiple_choice' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                selectedAnswer === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${questionIndex}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => onAnswer(e.target.value)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{option}</p>
                  </div>
                </div>
                {selectedAnswer === option && (
                  <div className="shrink-0 text-blue-600">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {/* True/False Options */}
      {question.question_type === 'true_false' && (
        <div className="space-y-3">
          {['True', 'False'].map((option) => (
            <label
              key={option}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                selectedAnswer === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${questionIndex}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => onAnswer(e.target.value)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{option}</p>
                  </div>
                </div>
                {selectedAnswer === option && (
                  <div className="shrink-0 text-blue-600">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Fill in the Blank */}
      {question.question_type === 'fill_blank' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <input
              type="text"
              value={selectedAnswer || ''}
              onChange={(e) => onAnswer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your answer here..."
            />
          </div>
        </div>
      )}

      {/* Skill Tags */}
      <div className="flex flex-wrap gap-2">
        {question.skill_tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default QuizQuestionComponent; 