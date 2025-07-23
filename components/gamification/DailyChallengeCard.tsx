'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Star, 
  CheckCircle2, 
  Circle, 
  Users, 
  Target, 
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { DailyChallengeCardProps } from '../../types/gamification';
import { Card } from '../ui/card';

const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onComplete,
  show_progress = true,
  show_guild_info = true
}) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (isCompleting || challenge.completed_at) return;

    setIsCompleting(true);
    try {
      await onComplete?.(challenge.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const isCompleted = !!challenge.completed_at;
  const progressPercentage = Math.min(
    (challenge.current_progress / challenge.target_progress) * 100,
    100
  );
  const timeRemaining = new Date(challenge.expires_at).getTime() - Date.now();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  const getDifficultyColor = () => {
    if (!(challenge as any).template) return 'text-gray-500';
    
    switch ((challenge as any).template.difficulty_level) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getDifficultyBadgeColor = () => {
    if (!(challenge as any).template) return 'bg-gray-100 text-gray-600';
    
    switch ((challenge as any).template.difficulty_level) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getChallengeIcon = () => {
    if (!(challenge as any).template) return <Target className="w-5 h-5" />;

    const iconMap = {
      quick_learner: <Zap className="w-5 h-5" />,
      mentor_session: <Users className="w-5 h-5" />,
      interview_prep: <Award className="w-5 h-5" />,
      daily_motivation: <Star className="w-5 h-5" />,
      perfect_score: <Target className="w-5 h-5" />,
      streak_maintainer: <TrendingUp className="w-5 h-5" />,
      skill_explorer: <Circle className="w-5 h-5" />,
      guild_contributor: <Users className="w-5 h-5" />,
      social_learner: <Users className="w-5 h-5" />,
      consistency_champion: <Award className="w-5 h-5" />
    };

    return challenge.template?.challenge_type ? iconMap[challenge.template.challenge_type] : <Target className="w-5 h-5" />;
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${
        isCompleted 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Challenge Icon */}
            <div className={`p-2 rounded-full ${
              isCompleted 
                ? 'bg-green-100 text-green-600' 
                : challenge.template?.is_social 
                ? 'bg-blue-100 text-blue-600'
                : 'bg-primary/10 text-primary'
            }`}>
              {getChallengeIcon()}
            </div>

            {/* Challenge Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${
                  isCompleted ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {challenge.template?.title || 'Daily Challenge'}
                </h3>
                
                {isCompleted && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
              </div>

              <p className={`text-sm ${
                isCompleted ? 'text-green-700' : 'text-gray-600'
              }`}>
                {challenge.template?.description || 'Complete this challenge to earn XP!'}
              </p>

              {/* Guild Info */}
              {show_guild_info && challenge.guild_challenge && challenge.guild && (
                <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                  <Users className="w-3 h-3" />
                  <span>Guild Challenge: {challenge.guild.display_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Completion Status */}
          <div className="text-right flex-shrink-0">
            {isCompleted ? (
              <div className="text-green-600">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs font-medium">Complete!</span>
              </div>
            ) : (
              <div className="text-gray-500">
                <Clock className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">
                  {hoursRemaining}h left
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {show_progress && (
        <div className="p-4 border-b bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {challenge.current_progress}/{challenge.target_progress}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-primary to-gray-700'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Challenge Details */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {/* Difficulty Badge */}
              {challenge.template && (
                <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyBadgeColor()}`}>
                  {challenge.template.difficulty_level}
                </span>
              )}

              {/* Social Badge */}
              {challenge.template?.is_social && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Social
                </span>
              )}
            </div>

            {/* XP Reward */}
            <div className="flex items-center gap-1 text-primary font-medium">
              <Star className="w-3 h-3" />
              <span>
                {(challenge.template?.xp_reward || 0) + (challenge.bonus_xp || 0)} XP
              </span>
              {(challenge.bonus_xp || 0) > 0 && (
                <span className="text-xs text-blue-600">
                  (+{challenge.bonus_xp || 0} bonus)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Section */}
      {!isCompleted && onComplete && (
        <div className="p-4">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isCompleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Completing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Complete</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Completion Celebration */}
      {isCompleted && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Challenge Completed!</span>
            </div>
            <p className="text-sm text-green-600">
              You earned{' '}
              <span className="font-medium">
                {(challenge.template?.xp_reward || 0) + (challenge.bonus_xp || 0)} XP
              </span>
              {(challenge.bonus_xp || 0) > 0 && (
                <span className="text-blue-600">
                  {' '}(+{challenge.bonus_xp || 0} guild bonus)
                </span>
              )}
            </p>
            {challenge.completed_at && (
              <p className="text-xs text-gray-500 mt-1">
                Completed {new Date(challenge.completed_at).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default DailyChallengeCard;