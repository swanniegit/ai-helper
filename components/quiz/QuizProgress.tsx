'use client';

import React from 'react';

interface QuizProgressProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answers: string[];
  onQuestionJump: (index: number) => void;
  answeredCount: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  totalQuestions,
  currentQuestionIndex,
  answers,
  onQuestionJump,
  answeredCount
}) => {
  const getQuestionStatus = (index: number) => {
    if (index === currentQuestionIndex) return 'current';
    if (answers[index] && answers[index] !== '') return 'answered';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-primary text-white';
      case 'answered':
        return 'bg-green-500 text-white';
      case 'unanswered':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Progress</h3>
      
      {/* Progress Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{answeredCount}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {Math.round((answeredCount / totalQuestions) * 100)}% complete
        </div>
      </div>

      {/* Question Navigation */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Questions</h4>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const status = getQuestionStatus(index);
            return (
              <button
                key={index}
                onClick={() => onQuestionJump(index)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(status)}`}
                title={`Question ${index + 1} - ${status}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span className="text-gray-600">Unanswered</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{answeredCount}</div>
            <div className="text-xs text-gray-600">Answered</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-600">{totalQuestions - answeredCount}</div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizProgress; 