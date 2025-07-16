'use client';

import React, { useEffect, useState } from 'react';

interface QuizTimerProps {
  timeRemaining: number;
  setTimeRemaining: (time: number | ((prev: number) => number)) => void;
  onTimeUp: () => void;
}

const QuizTimer: React.FC<QuizTimerProps> = ({ timeRemaining, setTimeRemaining, onTimeUp }) => {
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev: number) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, setTimeRemaining, onTimeUp]);

  useEffect(() => {
    // Show warning when less than 5 minutes remaining
    setIsWarning(timeRemaining <= 300);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-600 bg-red-100';
    if (timeRemaining <= 300) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getProgressPercentage = () => {
    // Assuming default time is 30 minutes (1800 seconds)
    const defaultTime = 1800;
    return Math.max(0, Math.min(100, (timeRemaining / defaultTime) * 100));
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTimerColor()}`}>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={isWarning ? 'animate-pulse' : ''}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="hidden sm:block w-24 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            timeRemaining <= 60 ? 'bg-red-500' : 
            timeRemaining <= 300 ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizTimer; 