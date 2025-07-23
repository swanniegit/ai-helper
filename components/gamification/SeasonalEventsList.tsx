'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Star, RefreshCw, Clock } from 'lucide-react';
import { SeasonalEvent, UserSeasonalProgress } from '../../types/gamification';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import SeasonalEventBanner from './SeasonalEventBanner';

interface SeasonalEventsListProps {
  show_upcoming?: boolean;
  compact?: boolean;
  max_events?: number;
}

const SeasonalEventsList: React.FC<SeasonalEventsListProps> = ({
  show_upcoming = true,
  compact = false,
  max_events
}) => {
  const [activeEvents, setActiveEvents] = useState<SeasonalEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SeasonalEvent[]>([]);
  const [userProgress, setUserProgress] = useState<UserSeasonalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSeasonalEvents();
  }, []);

  const fetchSeasonalEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active events with user progress
      const activeResponse = await fetch('/api/seasonal-events', {
        credentials: 'include'
      });

      if (!activeResponse.ok) {
        throw new Error('Failed to fetch seasonal events');
      }

      const activeResult = await activeResponse.json();
      if (activeResult.success) {
        setActiveEvents(activeResult.data.active_events || []);
        setUserProgress(activeResult.data.user_progress || []);
      }

      // Fetch upcoming events if requested
      if (show_upcoming) {
        const upcomingResponse = await fetch('/api/seasonal-events/upcoming', {
          credentials: 'include'
        });

        if (upcomingResponse.ok) {
          const upcomingResult = await upcomingResponse.json();
          if (upcomingResult.success) {
            setUpcomingEvents(upcomingResult.data || []);
          }
        }
      }

    } catch (err) {
      console.error('Seasonal events fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load seasonal events');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSeasonalEvents();
    setRefreshing(false);
  };

  const getUserProgressForEvent = (eventId: string): UserSeasonalProgress | undefined => {
    return userProgress.find(progress => progress.event_id === eventId);
  };

  const getEventsToDisplay = () => {
    let events = [...activeEvents];
    if (show_upcoming) {
      events = [...events, ...upcomingEvents];
    }
    
    if (max_events) {
      events = events.slice(0, max_events);
    }
    
    return events;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-4">
            {[...Array(compact ? 2 : 3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
          <Button 
            onClick={fetchSeasonalEvents}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const eventsToDisplay = getEventsToDisplay();

  if (eventsToDisplay.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-semibold mb-2">No Seasonal Events</h3>
          <p className="text-sm mb-4">
            Check back soon for exciting seasonal events and special challenges!
          </p>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Check for Events</span>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Seasonal Events
            </h2>
            <p className="text-gray-600 text-sm">
              Join special events for bonus XP, exclusive rewards, and community challenges
            </p>
          </div>

          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-6">
        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="space-y-4">
            {!compact && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-gray-900">Active Events</h3>
              </div>
            )}
            
            {activeEvents.slice(0, max_events || activeEvents.length).map((event) => (
              <SeasonalEventBanner
                key={event.id}
                event={event}
                user_progress={getUserProgressForEvent(event.id)}
                compact={compact}
                show_participation={true}
              />
            ))}
          </div>
        )}

        {/* Upcoming Events */}
        {show_upcoming && upcomingEvents.length > 0 && (
          <div className="space-y-4">
            {!compact && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
              </div>
            )}
            
            {upcomingEvents.slice(0, max_events ? max_events - activeEvents.length : upcomingEvents.length).map((event) => (
              <SeasonalEventBanner
                key={event.id}
                event={event}
                compact={compact}
                show_participation={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Stats Summary */}
      {!compact && userProgress.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Your Event Summary</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {userProgress.length}
              </div>
              <div className="text-sm text-gray-600">Events Joined</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {userProgress.reduce((sum, progress) => sum + (progress.xp_earned_during_event || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Event XP</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {userProgress.reduce((sum, progress) => sum + (progress.challenges_completed || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Challenges Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {userProgress.reduce((sum, progress) => sum + (progress.special_rewards_earned?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Special Rewards</div>
            </div>
          </div>
        </Card>
      )}

      {/* Tips for Events */}
      {!compact && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 mb-2">
            <Clock className="w-4 h-4" />
            <p className="text-sm font-medium">
              💡 Pro Tip: Join events early to maximize your rewards and take advantage of XP multipliers!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SeasonalEventsList;