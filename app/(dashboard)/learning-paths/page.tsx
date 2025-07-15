'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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
      const response = await fetch('/api/learning-paths');
      
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
        return 'bg-blue-100 text-blue-600';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Learning Paths</h2>
          <Link
            href="/learning-paths/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Path
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading your learning paths...</p>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Path
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchLearningPaths}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Learning Paths</h2>
        <Link
          href="/learning-paths/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Path
        </Link>
      </div>
      
      {learningPaths.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Learning Paths Yet</h3>
          <p className="text-gray-600 mb-6">Create your first personalized learning path to start your career development journey.</p>
          <Link
            href="/learning-paths/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Path
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path) => {
            const progress = calculateProgress(path);
            const icon = getCareerPathIcon(path.career_path);
            const colorClass = getCareerPathColor(path.career_path);
            
            return (
              <div key={path.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center mr-3`}>
                    <span className="font-semibold">{icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{path.title}</h3>
                    <p className="text-sm text-gray-500">
                      {path.career_path ? `${path.career_path} Developer` : 'Custom Path'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {path.description || `Timeline: ${path.timeline_months} months`}
                </p>
                
                {path.career_path && (
                  <div className="mb-4">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <span>Level: {path.current_level || 'Junior'} → {path.target_level || 'Intermediate'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {path.skill_assessments.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {skill.skill_name}
                        </span>
                      ))}
                      {path.skill_assessments.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{path.skill_assessments.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Continue Learning
                  </button>
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 