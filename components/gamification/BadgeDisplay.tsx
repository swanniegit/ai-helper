'use client';

import React from 'react';
import { Badge, CheckCircle2, Clock, Star } from 'lucide-react';
import { BadgeDisplayProps } from '../../types/gamification';
import { Card } from '../ui/card';

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  is_earned = false,
  earned_date,
  show_description = true
}) => {
  // Get the appropriate Lucide icon
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'baby': Badge,
      'target': CheckCircle2,
      'book-open': Badge,
      'briefcase': Badge,
      'heart': Badge,
      'flame': Badge,
      'calendar': Badge,
      'moon': Badge,
      'zap': Badge,
      'trending-up': Badge,
      'message-circle': Badge,
      'graduation-cap': Badge,
      'star': Star,
      'clock': Clock
    };

    return iconMap[iconName] || Badge;
  };

  const IconComponent = getIcon(badge.icon_name);

  return (
    <Card className={`p-4 transition-all duration-200 ${
      is_earned 
        ? 'bg-gradient-to-r from-primary/10 to-gray-100/50 border-primary/30 shadow-sm' 
        : 'bg-gray-50/80 border-gray-200 opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        {/* Badge Icon */}
        <div className={`flex-shrink-0 p-2 rounded-full ${
          is_earned 
            ? 'bg-primary/20 text-primary' 
            : 'bg-gray-200 text-gray-400'
        }`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Badge Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold text-sm ${
              is_earned ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {badge.name}
            </h3>
            
            {/* XP Reward */}
            {badge.xp_reward > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                <Star className="w-3 h-3" />
                <span>{badge.xp_reward} XP</span>
              </div>
            )}
          </div>

          {/* Badge Description */}
          {show_description && (
            <p className={`text-xs mt-1 ${
              is_earned ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {badge.description}
            </p>
          )}

          {/* Earned Date */}
          {is_earned && earned_date && (
            <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Earned {new Date(earned_date).toLocaleDateString()}</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
              badge.category === 'mastery' ? 'bg-blue-100 text-blue-800' :
              badge.category === 'streak' ? 'bg-orange-100 text-orange-800' :
              badge.category === 'special' ? 'bg-purple-100 text-purple-800' :
              'bg-green-100 text-green-800'
            }`}>
              {badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BadgeDisplay;