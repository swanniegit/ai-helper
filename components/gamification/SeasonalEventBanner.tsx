'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Star, 
  Trophy, 
  Users, 
  Zap, 
  Clock, 
  Target,
  Award,
  TrendingUp,
  Gift,
  Sparkles
} from 'lucide-react';
import { SeasonalEventBannerProps } from '../../types/gamification';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const SeasonalEventBanner: React.FC<SeasonalEventBannerProps> = ({
  event,
  user_progress,
  compact = false,
  show_participation = true
}) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
  }>({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(event.ends_at).getTime();
      const timeDiff = endTime - now;

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeRemaining({ days, hours, minutes });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [event.ends_at]);

  const getEventIcon = () => {
    const iconMap = {
      'star': <Star className="w-5 h-5" />,
      'trophy': <Trophy className="w-5 h-5" />,
      'zap': <Zap className="w-5 h-5" />,
      'gift': <Gift className="w-5 h-5" />,
      'sparkles': <Sparkles className="w-5 h-5" />,
      'award': <Award className="w-5 h-5" />,
      'target': <Target className="w-5 h-5" />
    };

    return iconMap[event.icon_name as keyof typeof iconMap] || <Star className="w-5 h-5" />;
  };

  const getEventTypeLabel = () => {
    switch (event.event_type) {
      case 'xp_boost':
        return 'XP Boost Event';
      case 'skill_focus':
        return 'Skill Focus Event';
      case 'challenge_series':
        return 'Challenge Series';
      case 'community_goal':
        return 'Community Goal';
      default:
        return 'Special Event';
    }
  };

  const getCommunityProgressPercentage = () => {
    if (!event.community_target) return 0;
    return Math.min((event.community_progress / event.community_target) * 100, 100);
  };

  const handleJoinEvent = async () => {
    try {
      const response = await fetch('/api/seasonal-events/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ event_id: event.id })
      });

      if (!response.ok) {
        throw new Error('Failed to join event');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh page or update state
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to join event');
      }
    } catch (err) {
      console.error('Join event error:', err);
      alert(err instanceof Error ? err.message : 'Failed to join event');
    }
  };

  const isEventActive = () => {
    const now = new Date().getTime();
    const startTime = new Date(event.starts_at).getTime();
    const endTime = new Date(event.ends_at).getTime();
    return now >= startTime && now <= endTime;
  };

  const isEventExpired = () => {
    const now = new Date().getTime();
    const endTime = new Date(event.ends_at).getTime();
    return now > endTime;
  };

  if (compact) {
    return (
      <Card className={`overflow-hidden border-2 border-${event.theme_color}-200 bg-gradient-to-r from-${event.theme_color}-50 to-${event.theme_color}-100`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-${event.theme_color}-500 text-white`}>
              {getEventIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
              <p className="text-xs text-gray-600">{getEventTypeLabel()}</p>
            </div>
            <div className="text-right">
              {isEventActive() && (
                <div className="text-xs text-gray-600">
                  {timeRemaining.days}d {timeRemaining.hours}h left
                </div>
              )}
              {event.xp_multiplier > 1 && (
                <div className={`text-sm font-medium text-${event.theme_color}-600`}>
                  {event.xp_multiplier}x XP
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden border-2 border-${event.theme_color}-200 bg-gradient-to-br from-${event.theme_color}-50 to-${event.theme_color}-100 shadow-lg`}>
      {/* Event Header */}
      <div className={`bg-gradient-to-r from-${event.theme_color}-500 to-${event.theme_color}-600 text-white p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              {getEventIcon()}
            </div>
            <div>
              <div className="text-sm font-medium opacity-90">{getEventTypeLabel()}</div>
              <h2 className="text-2xl font-bold">{event.title}</h2>
              <p className="text-sm opacity-90 mt-1">{event.description}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="text-right">
            {isEventExpired() ? (
              <div className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm font-medium">
                Event Ended
              </div>
            ) : isEventActive() ? (
              <div className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                Active Now
              </div>
            ) : (
              <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                Coming Soon
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6 space-y-6">
        {/* Timer and Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Remaining */}
          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
            <Clock className={`w-5 h-5 text-${event.theme_color}-600`} />
            <div>
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className="font-semibold text-gray-900">
                {isEventExpired() ? 'Event Ended' : 
                 `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`}
              </div>
            </div>
          </div>

          {/* XP Multiplier */}
          {event.xp_multiplier > 1 && (
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <Zap className={`w-5 h-5 text-${event.theme_color}-600`} />
              <div>
                <div className="text-sm text-gray-600">XP Multiplier</div>
                <div className="font-semibold text-gray-900">
                  {event.xp_multiplier}x Bonus
                </div>
              </div>
            </div>
          )}

          {/* Focus Category */}
          {event.focus_skill_category && (
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <Target className={`w-5 h-5 text-${event.theme_color}-600`} />
              <div>
                <div className="text-sm text-gray-600">Focus Area</div>
                <div className="font-semibold text-gray-900 capitalize">
                  {event.focus_skill_category}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Community Goal Progress */}
        {event.event_type === 'community_goal' && event.community_target && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className={`w-5 h-5 text-${event.theme_color}-600`} />
                <span className="font-semibold text-gray-900">Community Goal</span>
              </div>
              <span className="text-sm text-gray-600">
                {event.community_progress.toLocaleString()} / {event.community_target.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 bg-gradient-to-r from-${event.theme_color}-400 to-${event.theme_color}-600 transition-all duration-500 rounded-full`}
                style={{ width: `${getCommunityProgressPercentage()}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-600">
              {getCommunityProgressPercentage().toFixed(1)}% Complete
            </div>
          </div>
        )}

        {/* User Progress */}
        {show_participation && user_progress && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Progress
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {user_progress.participation_score}
                </div>
                <div className="text-xs text-gray-600">Participation Score</div>
              </div>
              
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {user_progress.xp_earned_during_event.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Event XP</div>
              </div>
              
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {user_progress.challenges_completed}
                </div>
                <div className="text-xs text-gray-600">Challenges Done</div>
              </div>
              
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {user_progress.special_rewards_earned.length}
                </div>
                <div className="text-xs text-gray-600">Special Rewards</div>
              </div>
            </div>
          </div>
        )}

        {/* Special Rewards */}
        {event.special_rewards.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Special Rewards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {event.special_rewards.map((reward, index) => {
                const isEarned = user_progress?.special_rewards_earned.some(
                  (earned: any) => earned.type === reward.type && earned.value === reward.value
                );
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                      isEarned 
                        ? `border-${event.theme_color}-300 bg-${event.theme_color}-50` 
                        : 'border-gray-200 bg-white/50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isEarned 
                        ? `bg-${event.theme_color}-500 text-white` 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {reward.type === 'badge' ? <Award className="w-4 h-4" /> :
                       reward.type === 'xp' ? <Star className="w-4 h-4" /> :
                       <Trophy className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isEarned ? 'text-gray-900' : 'text-gray-600'}`}>
                        {typeof reward.value === 'string' ? reward.value : `${reward.value} XP`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {reward.requirement.replace(/_/g, ' ')}
                      </div>
                    </div>
                    {isEarned && (
                      <div className={`text-${event.theme_color}-600 font-medium text-sm`}>
                        Earned!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Join/Participation Button */}
        {isEventActive() && !user_progress && (
          <div className="text-center pt-4 border-t">
            <Button
              onClick={handleJoinEvent}
              className={`bg-${event.theme_color}-500 hover:bg-${event.theme_color}-600 text-white`}
              size="lg"
            >
              <Star className="w-4 h-4 mr-2" />
              Join Event
            </Button>
          </div>
        )}

        {/* Event Dates */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(event.starts_at).toLocaleDateString()} - {new Date(event.ends_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SeasonalEventBanner;