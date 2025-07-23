'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Users, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { EnhancedUserDailyChallenge } from '../../types/gamification';
import { Card } from '../ui/card';
import DailyChallengeCard from './DailyChallengeCard';

interface DailyChallengesListProps {
  compact?: boolean;
  show_header?: boolean;
  max_challenges?: number;
}

const DailyChallengesList: React.FC<DailyChallengesListProps> = ({
  compact = false,
  show_header = true,
  max_challenges
}) => {
  const [challenges, setChallenges] = useState<EnhancedUserDailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/social/challenges/daily', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch daily challenges');
      }

      const result = await response.json();
      if (result.success) {
        let challengeList = result.data || [];
        
        // Limit challenges if max_challenges is specified
        if (max_challenges) {
          challengeList = challengeList.slice(0, max_challenges);
        }
        
        setChallenges(challengeList);
      } else {
        throw new Error(result.error || 'Failed to load challenges');
      }
    } catch (err) {
      console.error('Daily challenges fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshChallenges = async () => {
    setRefreshing(true);
    await fetchChallenges();
    setRefreshing(false);
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/social/challenges/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ challenge_id: challengeId })
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      const result = await response.json();
      if (result.success) {
        // Update the challenge in the list
        setChallenges(prev => 
          prev.map(challenge => 
            challenge.id === challengeId 
              ? { ...challenge, completed_at: new Date().toISOString(), current_progress: challenge.target_progress }
              : challenge
          )
        );
      } else {
        throw new Error(result.error || 'Failed to complete challenge');
      }
    } catch (err) {
      console.error('Complete challenge error:', err);
      alert(err instanceof Error ? err.message : 'Failed to complete challenge');
    }
  };

  const getCompletionStats = () => {
    const completed = challenges.filter(c => c.completed_at).length;
    const total = challenges.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, completionRate };
  };

  const getTotalPotentialXP = () => {
    return challenges.reduce((total, challenge) => {
      const baseXP = challenge.template?.xp_reward || 0;
      const bonusXP = challenge.bonus_xp || 0;
      return total + baseXP + bonusXP;
    }, 0);
  };

  const getEarnedXP = () => {
    return challenges
      .filter(c => c.completed_at)
      .reduce((total, challenge) => {
        const baseXP = challenge.template?.xp_reward || 0;
        const bonusXP = challenge.bonus_xp || 0;
        return total + baseXP + bonusXP;
      }, 0);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          {show_header && (
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          )}
          <div className="space-y-4">
            {[...Array(compact ? 2 : 4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchChallenges}
            className="mt-2 text-primary hover:text-primary/80 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-semibold mb-2">No Daily Challenges</h3>
          <p className="text-sm mb-4">
            Your daily challenges will be assigned automatically. Check back soon!
          </p>
          <button 
            onClick={handleRefreshChallenges}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Check for Challenges</span>
          </button>
        </div>
      </Card>
    );
  }

  const stats = getCompletionStats();
  const totalPotentialXP = getTotalPotentialXP();
  const earnedXP = getEarnedXP();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      {show_header && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Daily Challenges
            </h2>
            <p className="text-gray-600 text-sm">
              Complete challenges to earn XP and unlock achievements
            </p>
          </div>

          <button 
            onClick={handleRefreshChallenges}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* Stats Summary */}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}/{stats.total}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.completionRate}% completion rate
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">XP Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {earnedXP.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  of {totalPotentialXP.toLocaleString()} possible
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Guild Challenges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.filter(c => c.guild_challenge).length}
                </p>
                <p className="text-xs text-gray-500">
                  Social challenges
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Challenges List */}
      <div className={`space-y-4 ${compact ? 'max-h-96 overflow-y-auto' : ''}`}>
        {challenges.map((challenge) => (
          <DailyChallengeCard
            key={challenge.id}
            challenge={challenge}
            onComplete={handleCompleteChallenge}
            show_progress={!compact}
            show_guild_info={!compact}
          />
        ))}
      </div>

      {/* Time Remaining Notice */}
      {!compact && challenges.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock className="w-4 h-4" />
            <p className="text-sm font-medium">
              Daily challenges reset at midnight. Complete them before they expire!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DailyChallengesList;