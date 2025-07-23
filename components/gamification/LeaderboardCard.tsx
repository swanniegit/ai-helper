'use client';

import React from 'react';
import { Trophy, Users, TrendingUp, Calendar } from 'lucide-react';
import { LeaderboardData, SkillCategory, LeaderboardPeriod } from '../../types/gamification';
import { Card } from '../ui/card';

interface LeaderboardCardProps {
  skill_category: SkillCategory;
  time_period: LeaderboardPeriod;
  data?: LeaderboardData;
  onClick?: () => void;
  compact?: boolean;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  skill_category,
  time_period,
  data,
  onClick,
  compact = false
}) => {
  const formatPeriodTitle = (period: LeaderboardPeriod) => {
    const titles = {
      daily: 'Today',
      weekly: 'This Week',
      monthly: 'This Month',
      all_time: 'All Time'
    };
    return titles[period] || period;
  };

  const formatSkillCategory = (category: SkillCategory) => {
    return category === 'General' ? 'Overall' : category;
  };

  const getPeriodIcon = (period: LeaderboardPeriod) => {
    switch (period) {
      case 'daily':
        return <Calendar className="w-4 h-4" />;
      case 'weekly':
        return <TrendingUp className="w-4 h-4" />;
      case 'monthly':
        return <Calendar className="w-4 h-4" />;
      case 'all_time':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: SkillCategory) => {
    const colors = {
      PHP: 'from-purple-400 to-purple-600',
      Oracle: 'from-red-400 to-red-600',
      Database: 'from-blue-400 to-blue-600',
      'Web Development': 'from-green-400 to-green-600',
      General: 'from-primary to-gray-700'
    };
    return colors[category] || colors.General;
  };

  const topThree = data?.entries.slice(0, 3) || [];
  const userRank = data?.user_rank;
  const totalParticipants = data?.total_participants || 0;

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
      } ${compact ? 'p-4' : 'p-6'}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-1 rounded-full bg-gradient-to-r ${getCategoryColor(skill_category)}`}>
              {getPeriodIcon(time_period)}
            </div>
            <h3 className="font-semibold text-gray-900">
              {formatSkillCategory(skill_category)}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {formatPeriodTitle(time_period)}
          </p>
        </div>

        {totalParticipants > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{totalParticipants}</span>
          </div>
        )}
      </div>

      {/* Content */}
      {!data || topThree.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No rankings yet</p>
          <p className="text-xs text-gray-400">Be the first to compete!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top 3 */}
          {topThree.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                index === 1 ? 'bg-gray-50 border border-gray-200' :
                'bg-amber-50 border border-amber-200'
              }`}
            >
              <div className="flex-shrink-0">
                {index === 0 ? (
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                ) : index === 1 ? (
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {entry.anonymous_name}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.user_score.toLocaleString()} points
                </p>
              </div>

              <div className="text-xs text-gray-500">
                {entry.xp_earned} XP
              </div>
            </div>
          ))}

          {/* User Rank (if not in top 3) */}
          {userRank && userRank > 3 && (
            <>
              <div className="border-t border-gray-200 my-3"></div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{userRank}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">
                    Your Rank
                  </p>
                  <p className="text-xs text-gray-500">
                    {data?.user_entry?.user_score.toLocaleString()} points
                  </p>
                </div>

                <div className="text-xs text-primary font-medium">
                  {data?.user_entry?.xp_earned} XP
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* View Full Leaderboard Button */}
      {onClick && topThree.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View Full Leaderboard →
          </button>
        </div>
      )}
    </Card>
  );
};

export default LeaderboardCard;