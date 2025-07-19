'use client';

import React from 'react';
import { QuizTemplate, DifficultyLevel } from '../../types/quiz';

interface QuizTemplateCardProps {
  template: QuizTemplate;
  onStartQuiz: (templateId: string) => void;
}

const QuizTemplateCard: React.FC<QuizTemplateCardProps> = ({ template, onStartQuiz }) => {
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-900 border border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-900 border border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-900 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-900 border border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🚀';
      case 'advanced':
        return '⚡';
      default:
        return '📚';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {template.name}
            </h3>
            <p className="text-sm text-white/80 mb-3">
              {template.description}
            </p>
          </div>
          <span className="text-2xl ml-2">
            {getDifficultyIcon(template.difficulty_level)}
          </span>
        </div>

        {/* Difficulty Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty_level)}`}>
            {template.difficulty_level.charAt(0).toUpperCase() + template.difficulty_level.slice(1)}
          </span>
        </div>

        {/* Quiz Details */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-white/90">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {template.question_count} questions
          </div>
          <div className="flex items-center text-sm text-white/90">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {template.time_limit_minutes} minutes
          </div>
          <div className="flex items-center text-sm text-white/90">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pass: {template.passing_score}%
          </div>
        </div>

        {/* Skill Category */}
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900 border border-blue-200">
            {template.skill_category}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onStartQuiz(template.id)}
          className="w-full bg-gradient-to-r from-primary to-gray-800 hover:from-primary/90 hover:to-gray-800/90 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizTemplateCard; 