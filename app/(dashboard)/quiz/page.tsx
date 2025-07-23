'use client';

import React, { useState, useEffect } from 'react';
import { QuizTemplate, QuizProgress } from '../../../types/quiz';
import QuizTemplateCard from '../../../components/quiz/QuizTemplateCard';
import QuizProgressCard from '../../../components/quiz/QuizProgressCard';
import QuizGenerator from '../../../components/quiz/QuizGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

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
      const templatesResponse = await fetch('/api/quiz/templates', {
        credentials: 'include'
      });
      const templatesData = await templatesResponse.json();
      
      if (templatesData.success) {
        setTemplates(templatesData.data);
      }
      
      // Load progress
      const progressResponse = await fetch('/api/quiz/progress', {
        credentials: 'include'
      });
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
      <div className="min-h-screen bg-gradient-metro p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-metro p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Center</h1>
          <p className="text-white/80">
            Test your knowledge and track your progress with our interactive quizzes
          </p>
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="mb-8">
            <QuizProgressCard progress={progress} onViewDetails={() => {
              // Navigate to detailed progress page
              window.location.href = '/quiz/progress';
            }} />
          </div>
        )}

        {/* Quiz Generator */}
        <div className="mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <QuizGenerator onQuizGenerated={loadQuizData} />
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <p className="text-red-200">{error}</p>
              <Button
                onClick={loadQuizData}
                variant="outline"
                className="mt-2 text-red-200 hover:text-red-100 border-red-200/20"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quiz Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => (
              <QuizTemplateCard
                key={template.id}
                template={template}
                onStartQuiz={async (templateId) => {
                  try {
                    // Navigate to quiz taking page with template ID
                    window.location.href = `/quiz/take?template=${templateId}`;
                  } catch (error) {
                    console.error('Failed to start quiz:', error);
                  }
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-12">
                  <div className="text-white/40 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No quizzes available</h3>
                  <p className="text-white/60">
                    {selectedCategory === 'all' 
                      ? 'No quiz templates are currently available.'
                      : `No quizzes available for ${selectedCategory}.`
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {progress && progress.completed_quizzes > 0 && (
          <Card className="mt-12 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Your Quiz Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{progress.completed_quizzes}</div>
                  <div className="text-sm text-white/60">Quizzes Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{progress.average_score.toFixed(1)}%</div>
                  <div className="text-sm text-white/60">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{progress.skills_mastered.length}</div>
                  <div className="text-sm text-white/60">Skills Mastered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.floor(progress.total_time_spent / 60)}
                  </div>
                  <div className="text-sm text-white/60">Minutes Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 