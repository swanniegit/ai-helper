'use client';

import React, { useState, useEffect } from 'react';
import { QuizProgress } from '../../../../types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';

export default function QuizProgressPage() {
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quiz/progress', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setProgress(data.data);
      } else {
        setError(data.error || 'Failed to load progress');
      }
    } catch (err) {
      setError('Failed to load progress');
      console.error('Load progress error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-metro p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-metro p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-red-200 mb-4">{error}</p>
              <Button
                onClick={loadProgress}
                variant="outline"
                className="text-red-200 hover:text-red-100 border-red-200/20"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-metro p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <div className="text-white/40 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No progress data available</h3>
              <p className="text-white/60 mb-4">
                You haven&apos;t completed any quizzes yet. Start taking quizzes to see your progress here.
              </p>
              <Button
                onClick={() => window.location.href = '/quiz'}
                className="bg-gradient-to-r from-primary to-gray-700 text-white hover:from-primary/90 hover:to-gray-700/90"
              >
                Start Your First Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-metro p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Progress</h1>
          <p className="text-white/80">
            Track your learning journey and quiz performance
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{progress.completed_quizzes}</div>
              <div className="text-sm text-white/70">Quizzes Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{progress.average_score.toFixed(1)}%</div>
              <div className="text-sm text-white/70">Average Score</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{progress.skills_mastered.length}</div>
              <div className="text-sm text-white/70">Skills Mastered</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Math.floor(progress.total_time_spent / 60)}
              </div>
              <div className="text-sm text-white/70">Minutes Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Progress */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Skills Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            {progress.skills_mastered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {progress.skills_mastered.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No skills mastered yet. Keep taking quizzes to improve your skills!</p>
            )}
          </CardContent>
        </Card>

        {/* Weak Areas */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            {progress.weak_areas.length > 0 ? (
              <div className="space-y-2">
                {progress.weak_areas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-white">{area}</span>
                    <Button
                      onClick={() => window.location.href = `/quiz?category=${encodeURIComponent(area)}`}
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary/20 hover:bg-primary/10"
                    >
                      Practice
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No weak areas identified yet. Great job!</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 mb-4">
              Last quiz completed: {new Date(progress.last_quiz_date).toLocaleDateString()}
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => window.location.href = '/quiz'}
                className="bg-gradient-to-r from-primary to-gray-700 text-white hover:from-primary/90 hover:to-gray-700/90"
              >
                Take Another Quiz
              </Button>
              <Button
                onClick={() => window.location.href = '/quiz/history'}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
              >
                View Quiz History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}