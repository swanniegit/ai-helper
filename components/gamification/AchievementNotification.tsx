'use client';

import React, { useEffect, useState } from 'react';
import { X, Star, Trophy, Sparkles } from 'lucide-react';
import { AchievementNotificationProps } from '../../types/gamification';
import { Card } from '../ui/card';

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto close if enabled
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, handleClose]);

  // Get the appropriate Lucide icon for the badge
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'baby': Star,
      'target': Trophy,
      'book-open': Star,
      'briefcase': Star,
      'heart': Star,
      'flame': Star,
      'calendar': Star,
      'moon': Star,
      'zap': Star,
      'trending-up': Star,
      'message-circle': Star,
      'graduation-cap': Trophy,
      'star': Star
    };

    return iconMap[iconName] || Star;
  };

  const IconComponent = getIcon(achievement.badge?.icon_name || 'star');

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : isLeaving
          ? 'translate-x-full opacity-0 scale-95'
          : 'translate-x-full opacity-0 scale-95'
      }`}
      style={{ maxWidth: '400px' }}
    >
      <Card className="bg-gradient-to-r from-primary/90 to-gray-700/90 backdrop-blur-sm border-primary/30 shadow-xl">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1 bg-white/20 rounded-full">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Achievement Unlocked!</span>
            </div>
            
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white/80 hover:text-white" />
            </button>
          </div>

          {/* Achievement Content */}
          <div className="flex items-start gap-3">
            {/* Badge Icon with Animation */}
            <div className="relative">
              <div className="p-3 bg-white/20 rounded-full">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              
              {/* Sparkle Animation */}
              <div className="absolute -top-1 -right-1 animate-pulse">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
            </div>

            {/* Badge Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg mb-1">
                {achievement.badge?.name}
              </h3>
              
              <p className="text-white/90 text-sm mb-2">
                {achievement.badge?.description}
              </p>

              {/* XP Reward */}
              {achievement.badge?.xp_reward && achievement.badge.xp_reward > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-full w-fit">
                  <Star className="w-3 h-3" />
                  <span>+{achievement.badge.xp_reward} XP</span>
                </div>
              )}
            </div>
          </div>

          {/* Celebration Border */}
          <div className="absolute inset-0 rounded-lg border-2 border-yellow-300/50 animate-pulse pointer-events-none" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping" />
          <div className="absolute top-6 right-4 w-1 h-1 bg-white rounded-full animate-ping animation-delay-300" />
          <div className="absolute bottom-4 left-6 w-1 h-1 bg-yellow-300 rounded-full animate-ping animation-delay-700" />
        </div>
      </Card>
    </div>
  );
};

export default AchievementNotification;