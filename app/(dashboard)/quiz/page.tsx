'use client';

import React, { useState, useEffect } from 'react';
import { QuizTemplate, QuizProgress } from '../../../types/quiz';
import QuizTemplateCard from '../../../components/quiz/QuizTemplateCard';
import QuizProgressCard from '../../../components/quiz/QuizProgressCard';
import QuizGenerator from '../../../components/quiz/QuizGenerator';

export default function QuizPage() {
  const [templates, setTemplates] = useState<QuizTemplate[]>([]);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadQuizData();
  }, []);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      
      // Load templates
      const templatesResponse = await fetch('/api/quiz/templates');
      const templatesData = await templatesResponse.json();
      
      if (templatesData.success) {
        setTemplates(templatesData.data);
      }
      
      // Load progress
      const progressResponse = await fetch('/api/quiz/progress');
      const progressData = await progressResponse.json();
      
      if (progressData.success) {
        setProgress(progressData.data);
      }
      
    } catch (err) {
      setError('Failed to load quiz data');
      console.error('Load quiz data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.skill_category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.skill_category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Center</h1>
          <p className="text-gray-600">
            Test your knowledge and track your progress with our interactive quizzes
          </p>
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="mb-8">
            <QuizProgressCard progress={progress} onViewDetails={() => {}} />
          </div>
        )}

        {/* Quiz Generator */}
        <div className="mb-8">
          <QuizGenerator onQuizGenerated={loadQuizData} />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadQuizData}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Quiz Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => (
              <QuizTemplateCard
                key={template.id}
                template={template}
                onStartQuiz={() => {}}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
              <p className="text-gray-500">
                {selectedCategory === 'all' 
                  ? 'No quiz templates are currently available.'
                  : `No quizzes available for ${selectedCategory}.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {progress && progress.completed_quizzes > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Quiz Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.completed_quizzes}</div>
                <div className="text-sm text-gray-600">Quizzes Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.average_score.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{progress.skills_mastered.length}</div>
                <div className="text-sm text-gray-600">Skills Mastered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.floor(progress.total_time_spent / 60)}
                </div>
                <div className="text-sm text-gray-600">Minutes Spent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 