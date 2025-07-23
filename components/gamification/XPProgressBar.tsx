'use client';

import React from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { XPProgressBarProps } from '../../types/gamification';
import { LEVEL_THRESHOLDS } from '../../types/gamification';

const XPProgressBar: React.FC<XPProgressBarProps> = ({
  current_xp,
  current_level,
  level_progress,
  show_level_name = true,
  size = 'md'
}) => {
  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'p-3',
      text: 'text-sm',
      bar: 'h-2',
      icon: 'w-4 h-4'
    },
    md: {
      container: 'p-4',
      text: 'text-base',
      bar: 'h-3',
      icon: 'w-5 h-5'
    },
    lg: {
      container: 'p-6',
      text: 'text-lg',
      bar: 'h-4',
      icon: 'w-6 h-6'
    }
  };

  const classes = sizeClasses[size];

  // Get next level info
  const currentLevelConfig = LEVEL_THRESHOLDS[current_level];
  const nextLevelEntry = Object.entries(LEVEL_THRESHOLDS).find(
    ([, config]) => config.min_xp > currentLevelConfig.min_xp
  );
  
  const nextLevel = nextLevelEntry?.[1].level;
  const nextLevelXP = nextLevelEntry?.[1].min_xp;
  const xpNeeded = nextLevelXP ? nextLevelXP - current_xp : 0;

  // Level color scheme
  const getLevelColor = (level: string) => {
    const colors = {
      'Code Apprentice': 'from-gray-400 to-gray-600',
      'Bug Hunter': 'from-green-400 to-green-600',
      'Logic Architect': 'from-blue-400 to-blue-600',
      'Code Wizard': 'from-purple-400 to-purple-600',
      'Dev Sage': 'from-yellow-400 to-yellow-600'
    };
    return colors[level as keyof typeof colors] || 'from-primary to-gray-700';
  };

  const levelGradient = getLevelColor(current_level);

  return (
    <div className={`bg-card/80 backdrop-blur-sm rounded-lg border ${classes.container}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full bg-gradient-to-r ${levelGradient}`}>
            <Star className={`${classes.icon} text-white`} />
          </div>
          {show_level_name && (
            <div>
              <h3 className={`font-semibold text-gray-900 ${classes.text}`}>
                {current_level}
              </h3>
              {nextLevel && (
                <p className="text-xs text-gray-500">
                  Next: {nextLevel}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className={`font-bold text-primary ${classes.text}`}>
            {current_xp.toLocaleString()} XP
          </div>
          {nextLevel && xpNeeded > 0 && (
            <p className="text-xs text-gray-500">
              {xpNeeded.toLocaleString()} to next level
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span className="text-xs font-medium text-primary">
            {level_progress.toFixed(1)}%
          </span>
        </div>
        
        <div className={`w-full bg-gray-200 rounded-full ${classes.bar} overflow-hidden`}>
          <div
            className={`${classes.bar} bg-gradient-to-r ${levelGradient} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(level_progress, 100)}%` }}
          >
            {/* Animated shine effect */}
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Level Perks (for larger sizes) */}
      {size === 'lg' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Level {current_level} Perks Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;