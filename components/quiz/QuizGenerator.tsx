'use client';

import React, { useState } from 'react';
import { DifficultyLevel, QuizType } from '../../types/quiz';

interface QuizGeneratorProps {
  onQuizGenerated: () => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onQuizGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skill_category: '',
    difficulty_level: 'intermediate' as DifficultyLevel,
    question_count: 15,
    quiz_type: 'practice' as QuizType
  });

  const skillCategories = [
    'PHP OOP',
    'Laravel Framework',
    'Oracle SQL',
    'PL/SQL',
    'Database Design',
    'Web Development',
    'API Development',
    'Security',
    'Performance',
    'Testing'
  ];

  const difficultyLevels: { value: DifficultyLevel; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'Basic concepts and fundamentals' },
    { value: 'intermediate', label: 'Intermediate', description: 'Practical applications and best practices' },
    { value: 'advanced', label: 'Advanced', description: 'Complex scenarios and optimization' }
  ];

  const quizTypes: { value: QuizType; label: string; description: string }[] = [
    { value: 'practice', label: 'Practice Quiz', description: 'General practice questions' },
    { value: 'skills_assessment', label: 'Skills Assessment', description: 'Evaluate your current skill level' },
    { value: 'progress_check', label: 'Progress Check', description: 'Test your learning progress' },
    { value: 'certification', label: 'Certification Prep', description: 'Prepare for professional certifications' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.skill_category) {
      alert('Please select a skill category');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to quiz page with session token
        window.location.href = `/quiz/take?session=${data.data.session_token}`;
        onQuizGenerated();
      } else {
        alert(data.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Generate Custom Quiz</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create a personalized quiz with AI-powered questions
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isOpen ? 'Hide Generator' : 'Show Generator'}
          <svg
            className={`ml-2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Category *
            </label>
            <select
              value={formData.skill_category}
              onChange={(e) => handleInputChange('skill_category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a skill category</option>
              {skillCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {difficultyLevels.map(level => (
                <label
                  key={level.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.difficulty_level === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty_level"
                    value={level.value}
                    checked={formData.difficulty_level === level.value}
                    onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{level.label}</p>
                        <p className="text-gray-500">{level.description}</p>
                      </div>
                    </div>
                    {formData.difficulty_level === level.value && (
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
          </div>

          {/* Quiz Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quizTypes.map(type => (
                <label
                  key={type.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.quiz_type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="quiz_type"
                    value={type.value}
                    checked={formData.quiz_type === type.value}
                    onChange={(e) => handleInputChange('quiz_type', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-gray-500">{type.description}</p>
                      </div>
                    </div>
                    {formData.quiz_type === type.value && (
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
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={formData.question_count}
                onChange={(e) => handleInputChange('question_count', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                {formData.question_count}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.skill_category}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Quiz...
                </div>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default QuizGenerator; 