'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Users, Clock, Star } from 'lucide-react';
import { LeaderboardDisplayProps, LeaderboardData, LeaderboardEntry } from '../../types/gamification';
import { Card } from '../ui/card';

const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({
  skill_category,
  time_period,
  show_user_rank = true,
  compact = false
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [skill_category, time_period]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/social/leaderboard?skill_category=${skill_category}&time_period=${time_period}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const result = await response.json();
      if (result.success) {
        setLeaderboardData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBackground = (rank: number, isUserEntry: boolean = false) => {
    if (isUserEntry) {
      return 'bg-primary/10 border-primary/30';
    }
    
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const formatPeriodTitle = (period: string) => {
    const titles = {
      daily: 'Today',
      weekly: 'This Week',
      monthly: 'This Month',
      all_time: 'All Time'
    };
    return titles[period as keyof typeof titles] || period;
  };

  const formatSkillCategory = (category: string) => {
    return category === 'General' ? 'Overall' : category;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchLeaderboardData}
            className="mt-2 text-primary hover:text-primary/80 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  if (!leaderboardData || leaderboardData.entries.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No rankings available yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Complete some {skill_category.toLowerCase()} activities to appear on the leaderboard!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-gray-100/50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-bold text-gray-900">
                {formatSkillCategory(skill_category)} Leaderboard
              </h3>
              <p className="text-sm text-gray-600">
                {formatPeriodTitle(time_period)} • {leaderboardData.total_participants} participants
              </p>
            </div>
          </div>
          
          {!compact && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Updates every hour</span>
            </div>
          )}
        </div>
      </div>

      {/* User Rank Banner (if user is ranked and show_user_rank is true) */}
      {show_user_rank && leaderboardData.user_entry && (
        <div className="p-3 bg-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getRankIcon(leaderboardData.user_rank || 0)}
                <span className="font-semibold text-primary">Your Rank</span>
              </div>
              <div className="text-sm text-gray-600">
                {leaderboardData.user_entry.user_score.toLocaleString()} points
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{leaderboardData.user_entry.xp_earned} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{leaderboardData.user_entry.streak_days} day streak</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className="divide-y divide-gray-100">
        {leaderboardData.entries.map((entry, index) => {
          const isUserEntry = leaderboardData.user_entry?.id === entry.id;
          
          return (
            <div
              key={entry.id}
              className={`p-4 transition-colors ${getRankBackground(entry.user_rank, isUserEntry)} ${
                isUserEntry ? 'ring-1 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Rank Icon */}
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.user_rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">
                        {entry.anonymous_name}
                      </span>
                      {isUserEntry && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    
                    {!compact && (
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{entry.quizzes_completed} quizzes</span>
                        <span>{entry.perfect_scores} perfect scores</span>
                        <span>{entry.streak_days} day streak</span>
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {entry.user_score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.xp_earned} XP
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {!compact && leaderboardData.entries.length >= 10 && (
        <div className="p-3 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Showing top {leaderboardData.entries.length} of {leaderboardData.total_participants} participants
          </p>
        </div>
      )}
    </Card>
  );
};

export default LeaderboardDisplay;