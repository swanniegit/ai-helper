'use client';

import React from 'react';
import { QuizProgress } from '../../types/quiz';

interface QuizProgressCardProps {
  progress: QuizProgress;
  onViewDetails: () => void;
}

const QuizProgressCard: React.FC<QuizProgressCardProps> = ({ progress, onViewDetails }) => {
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Quiz Progress</h2>
        <button
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Completed Quizzes */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {progress.completed_quizzes}
          </div>
          <div className="text-sm text-gray-600">Quizzes Completed</div>
        </div>

        {/* Average Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${getProgressColor(progress.average_score)}`}>
            {progress.average_score.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressBarColor(progress.average_score)}`}
                style={{ width: `${Math.min(progress.average_score, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Skills Mastered */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {progress.skills_mastered.length}
          </div>
          <div className="text-sm text-gray-600">Skills Mastered</div>
        </div>

        {/* Time Spent */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.floor(progress.total_time_spent / 60)}
          </div>
          <div className="text-sm text-gray-600">Minutes Spent</div>
        </div>
      </div>

      {/* Skills Overview */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Skills Mastered */}
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-2">✅ Skills Mastered</h4>
            {progress.skills_mastered.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {progress.skills_mastered.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {skill}
                  </span>
                ))}
                {progress.skills_mastered.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{progress.skills_mastered.length - 5} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No skills mastered yet. Keep practicing!</p>
            )}
          </div>

          {/* Skills Needing Improvement */}
          <div>
            <h4 className="text-sm font-medium text-orange-700 mb-2">📈 Skills to Improve</h4>
            {progress.skills_needing_improvement.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {progress.skills_needing_improvement.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {skill}
                  </span>
                ))}
                {progress.skills_needing_improvement.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{progress.skills_needing_improvement.length - 5} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Great job! All skills are performing well.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      {progress.recent_performance.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Performance</h3>
          <div className="space-y-2">
            {progress.recent_performance.slice(0, 3).map((performance, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getProgressBarColor(performance.score)}`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{performance.quiz_name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(performance.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-semibold ${getProgressColor(performance.score)}`}>
                  {performance.score.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizProgressCard; 