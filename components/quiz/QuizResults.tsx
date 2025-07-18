'use client';

import React from 'react';
import { QuizResult, QuizFeedback } from '../../types/quiz';

interface QuizResultsProps {
  result: QuizResult;
  feedback: QuizFeedback;
  onRetake: () => void;
  onContinue: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  feedback,
  onRetake,
  onContinue
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return '🏆';
      case 'good':
        return '👍';
      case 'fair':
        return '📊';
      case 'needs_improvement':
        return '📈';
      default:
        return '📊';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p className="text-gray-600">
            {result.skill_category} - {result.difficulty_level} Level
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBackground(result.percentage_score)} mb-4`}>
              <span className={`text-3xl font-bold ${getScoreColor(result.percentage_score)}`}>
                {result.percentage_score.toFixed(1)}%
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {result.passed ? 'Congratulations! You Passed!' : 'Keep Learning!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {result.passed 
                ? 'Great job on completing this quiz successfully!'
                : 'Don\'t worry, every attempt is a learning opportunity.'
              }
            </p>
          </div>

          {/* Score Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{result.score}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{result.total_questions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {result.time_taken_seconds ? formatTime(result.time_taken_seconds) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Performance Feedback */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">{getPerformanceIcon(feedback.overall_performance)}</span>
            <h3 className="text-xl font-semibold text-gray-900">
              Performance Analysis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div>
              <h4 className="text-lg font-medium text-green-700 mb-3">✅ Your Strengths</h4>
              {feedback.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No specific strengths identified yet.</p>
              )}
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="text-lg font-medium text-orange-700 mb-3">📈 Areas for Improvement</h4>
              {feedback.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {feedback.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Great job! No major areas for improvement identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h3>
          
          <div className="space-y-6">
            {/* Next Steps */}
            <div>
              <h4 className="text-lg font-medium text-primary mb-3">🎯 Next Steps</h4>
              <ul className="space-y-2">
                {feedback.next_steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skill Gaps */}
            {feedback.skill_gaps.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-primary mb-3">🔍 Skill Gaps Identified</h4>
                <div className="flex flex-wrap gap-2">
                  {feedback.skill_gaps.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Improvement Time */}
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-primary mr-2">⏱️</span>
                <span className="text-primary font-medium">
                  Estimated time to improve: {feedback.estimated_improvement_time}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetake}
            className="px-8 py-3 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg hover:from-primary/90 hover:to-gray-700/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Back to Quiz Center
          </button>
        </div>

        {/* Quiz Details */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Quiz completed on {new Date(result.taken_at).toLocaleDateString()}</p>
          <p>Difficulty: {result.difficulty_level.charAt(0).toUpperCase() + result.difficulty_level.slice(1)}</p>
        </div>
      </div>
    </div>
  );
};

export default QuizResults; 