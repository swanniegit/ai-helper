'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy,
  Star,
  Crown,
  Sparkles,
  Award,
  TrendingUp,
  Gift,
  Zap,
  Target,
  BookOpen,
  Users,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelebrationReward {
  type: 'xp' | 'level' | 'badge' | 'achievement' | 'item' | 'title';
  name: string;
  description: string;
  value?: number;
  icon?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface CelebrationData {
  celebration_type: 'level_up' | 'quest_complete' | 'achievement_unlock' | 'skill_mastery' | 'milestone_reached';
  title: string;
  description: string;
  rewards: CelebrationReward[];
  previous_level?: number;
  new_level?: number;
  total_xp?: number;
  quest_name?: string;
  achievement_name?: string;
  skill_name?: string;
}

interface CelebrationModalProps {
  celebration_data: CelebrationData;
  is_open: boolean;
  on_close: () => void;
  auto_close_delay?: number;
  className?: string;
}

export default function CelebrationModal({
  celebration_data,
  is_open,
  on_close,
  auto_close_delay = 8000,
  className
}: CelebrationModalProps) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter');

  useEffect(() => {
    if (is_open) {
      setAnimationPhase('enter');
      setShowFireworks(true);
      
      // Transition to celebration phase
      const celebrateTimer = setTimeout(() => {
        setAnimationPhase('celebrate');
      }, 500);

      // Auto-close if specified
      const autoCloseTimer = setTimeout(() => {
        if (auto_close_delay > 0) {
          handleClose();
        }
      }, auto_close_delay);

      return () => {
        clearTimeout(celebrateTimer);
        clearTimeout(autoCloseTimer);
      };
    }
  }, [is_open, auto_close_delay]);

  const handleClose = () => {
    setAnimationPhase('exit');
    setShowFireworks(false);
    setTimeout(() => {
      on_close();
    }, 300);
  };

  const getCelebrationIcon = (type: string) => {
    switch (type) {
      case 'level_up': return <TrendingUp className="w-8 h-8" />;
      case 'quest_complete': return <BookOpen className="w-8 h-8" />;
      case 'achievement_unlock': return <Award className="w-8 h-8" />;
      case 'skill_mastery': return <Target className="w-8 h-8" />;
      case 'milestone_reached': return <Crown className="w-8 h-8" />;
      default: return <Sparkles className="w-8 h-8" />;
    }
  };

  const getCelebrationColor = (type: string) => {
    switch (type) {
      case 'level_up': return 'from-yellow-400 to-orange-500';
      case 'quest_complete': return 'from-blue-400 to-purple-500';
      case 'achievement_unlock': return 'from-green-400 to-emerald-500';
      case 'skill_mastery': return 'from-purple-400 to-pink-500';
      case 'milestone_reached': return 'from-red-400 to-rose-500';
      default: return 'from-primary to-gray-600';
    }
  };

  const getRewardIcon = (reward: CelebrationReward) => {
    switch (reward.type) {
      case 'xp': return <Zap className="w-5 h-5" />;
      case 'level': return <TrendingUp className="w-5 h-5" />;
      case 'badge': return <Star className="w-5 h-5" />;
      case 'achievement': return <Award className="w-5 h-5" />;
      case 'item': return <Gift className="w-5 h-5" />;
      case 'title': return <Crown className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getRarityColor = (rarity: string = 'common') => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!is_open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          animationPhase === 'enter' ? 'opacity-0' : 'opacity-100'
        )}
        onClick={handleClose}
      />
      
      {/* Fireworks Background Animation */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated sparkles */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping",
                `top-${Math.floor(Math.random() * 100)}% left-${Math.floor(Math.random() * 100)}%`
              )}
              style={{
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Modal */}
      <Card 
        className={cn(
          "relative max-w-2xl w-full max-h-[90vh] overflow-auto border-4 shadow-2xl",
          "transform transition-all duration-500",
          animationPhase === 'enter' 
            ? 'scale-50 opacity-0 rotate-12' 
            : animationPhase === 'celebrate'
            ? 'scale-100 opacity-100 rotate-0'
            : 'scale-75 opacity-0 -rotate-6',
          className
        )}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Header with Celebration Theme */}
        <CardHeader className="text-center pb-4">
          <div className={cn(
            "mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg",
            "bg-gradient-to-br",
            getCelebrationColor(celebration_data.celebration_type),
            animationPhase === 'celebrate' && "animate-bounce"
          )}>
            {getCelebrationIcon(celebration_data.celebration_type)}
          </div>
          
          <CardTitle className="text-3xl font-bold mb-2 text-center">
            {celebration_data.title}
          </CardTitle>
          
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {celebration_data.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Level Up Specific Display */}
          {celebration_data.celebration_type === 'level_up' && celebration_data.new_level && (
            <div className="text-center py-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-4xl font-bold text-gray-400">
                  {celebration_data.previous_level || celebration_data.new_level - 1}
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-8 h-8 text-yellow-600 mb-1" />
                  <div className="text-sm text-gray-600 font-medium">LEVEL UP!</div>
                </div>
                <div className="text-4xl font-bold text-yellow-600">
                  {celebration_data.new_level}
                </div>
              </div>
              
              {celebration_data.total_xp && (
                <div className="text-sm text-gray-600">
                  Total XP: {celebration_data.total_xp.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Quest/Achievement/Skill Specific Info */}
          {celebration_data.quest_name && (
            <div className="text-center py-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Quest Completed</span>
              </div>
              <div className="text-blue-700 font-semibold">{celebration_data.quest_name}</div>
            </div>
          )}

          {celebration_data.achievement_name && (
            <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Achievement Unlocked</span>
              </div>
              <div className="text-green-700 font-semibold">{celebration_data.achievement_name}</div>
            </div>
          )}

          {celebration_data.skill_name && (
            <div className="text-center py-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Skill Mastered</span>
              </div>
              <div className="text-purple-700 font-semibold">{celebration_data.skill_name}</div>
            </div>
          )}

          {/* Rewards Section */}
          {celebration_data.rewards.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4 flex items-center justify-center gap-2">
                <Gift className="w-5 h-5" />
                Rewards Earned
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {celebration_data.rewards.map((reward, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 bg-white shadow-sm",
                      "transform transition-all duration-300 hover:scale-105",
                      animationPhase === 'celebrate' && "animate-pulse"
                    )}
                    style={{
                      animationDelay: `${index * 200}ms`
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {reward.icon ? (
                          <span className="text-lg">{reward.icon}</span>
                        ) : (
                          getRewardIcon(reward)
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {reward.name}
                        </span>
                        {reward.value && (
                          <span className="text-sm font-bold text-primary">
                            +{reward.value}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {reward.description}
                      </p>
                      
                      {reward.rarity && (
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs mt-1", getRarityColor(reward.rarity))}
                        >
                          {reward.rarity}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              onClick={handleClose}
              size="lg"
              className="bg-gradient-to-r from-primary to-gray-600 text-white hover:from-primary/90 hover:to-gray-600/90 min-w-[120px]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Awesome!
            </Button>
          </div>

          {/* Motivational Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              Keep up the amazing progress! Your coding journey continues...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}