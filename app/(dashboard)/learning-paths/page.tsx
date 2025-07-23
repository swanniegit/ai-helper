'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LearningPath {
  id: string;
  title: string;
  description?: string;
  career_path?: 'PHP' | 'Oracle';
  current_level?: 'Junior' | 'Intermediate' | 'Senior';
  target_level?: 'Junior' | 'Intermediate' | 'Senior';
  timeline_months: number;
  status: string;
  created_at: string;
  skill_assessments: Array<{
    skill_name: string;
    skill_level: string;
  }>;
  career_goals: Array<{
    goal_text: string;
    priority: number;
  }>;
  learning_plans: Array<{
    summary: string;
    estimated_hours: number;
    plan_quarters: Array<{
      quarter_number: number;
      title: string;
      estimated_hours: number;
    }>;
  }>;
}

export default function LearningPathsPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      const response = await fetch('/api/learning-paths', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch learning paths');
      }

      const data = await response.json();
      setLearningPaths(data.learning_paths || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCareerPathIcon = (careerPath?: string) => {
    switch (careerPath) {
      case 'PHP':
        return '🐘';
      case 'Oracle':
        return '🗄️';
      default:
        return '🎯';
    }
  };

  const getCareerPathColor = (careerPath?: string) => {
    switch (careerPath) {
      case 'PHP':
        return 'bg-purple-100 text-purple-600';
      case 'Oracle':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const calculateProgress = (learningPath: LearningPath) => {
    // Simple progress calculation based on completed quarters
    if (!learningPath.learning_plans || learningPath.learning_plans.length === 0) {
      return 0;
    }
    
    const plan = learningPath.learning_plans[0];
    const totalQuarters = plan.plan_quarters.length;
    // For now, return a random progress (in real app, this would be based on actual progress)
    return Math.floor(Math.random() * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-metro p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-primary-foreground">Learning Paths</h2>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/learning-paths/new">
                Create New Path
              </Link>
            </Button>
          </div>
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading your learning paths...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Learning Paths</h2>
          <Link
            href="/learning-paths/new"
            className="px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg hover:from-primary/90 hover:to-gray-700/90 transition-colors"
          >
            Create New Path
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchLearningPaths}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg hover:from-primary/90 hover:to-gray-700/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-metro p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-primary-foreground">Learning Paths</h2>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/learning-paths/new">
              Create New Path
            </Link>
          </Button>
        </div>
        
        {learningPaths.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <CardTitle className="text-xl mb-2">No Learning Paths Yet</CardTitle>
              <CardDescription className="mb-6">
                Create your first personalized learning path to start your career development journey.
              </CardDescription>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/learning-paths/new">
                  Create Your First Path
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path) => {
              const progress = calculateProgress(path);
              const icon = getCareerPathIcon(path.career_path);
              
              return (
                <Card key={path.id} className="bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-all">
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <span className="font-semibold text-primary">{icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{path.title}</CardTitle>
                        <CardDescription>
                          {path.career_path ? `${path.career_path} Developer` : 'Custom Path'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {path.description || `Timeline: ${path.timeline_months} months`}
                    </p>
                    
                    {path.career_path && (
                      <div>
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                          <span>Level: {path.current_level || 'Junior'} → {path.target_level || 'Intermediate'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {path.skill_assessments.slice(0, 3).map((skill, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                            >
                              {skill.skill_name}
                            </span>
                          ))}
                          {path.skill_assessments.length > 3 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                              +{path.skill_assessments.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-primary hover:bg-primary/90 text-sm">
                        Continue Learning
                      </Button>
                      <Button variant="outline" className="text-sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 