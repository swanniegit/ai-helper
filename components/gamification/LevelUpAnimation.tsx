'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Sparkles,
  Star,
  Crown,
  Zap,
  Trophy,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelUpData {
  previous_level: number;
  new_level: number;
  level_name: string;
  total_xp: number;
  xp_gained: number;
  unlocked_features?: string[];
  next_level_xp_required?: number;
}

interface LevelUpAnimationProps {
  level_data: LevelUpData;
  is_visible: boolean;
  on_complete: () => void;
  duration?: number;
  className?: string;
}

export default function LevelUpAnimation({
  level_data,
  is_visible,
  on_complete,
  duration = 4000,
  className
}: LevelUpAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'rising' | 'celebration' | 'complete'>('hidden');
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (is_visible) {
      // Phase 1: Rising animation
      setAnimationPhase('rising');
      setShowSparkles(true);
      
      // Phase 2: Celebration
      const celebrationTimer = setTimeout(() => {
        setAnimationPhase('celebration');
      }, 1000);

      // Phase 3: Auto complete
      const completeTimer = setTimeout(() => {
        setAnimationPhase('complete');
        setTimeout(() => {
          on_complete();
        }, 500);
      }, duration);

      return () => {
        clearTimeout(celebrationTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setAnimationPhase('hidden');
      setShowSparkles(false);
    }
  }, [is_visible, duration, on_complete]);

  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-12 h-12 text-yellow-600" />;
    if (level >= 7) return <Trophy className="w-12 h-12 text-purple-600" />;
    if (level >= 4) return <Star className="w-12 h-12 text-blue-600" />;
    return <TrendingUp className="w-12 h-12 text-green-600" />;
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'from-yellow-400 via-orange-500 to-red-500';
    if (level >= 7) return 'from-purple-400 via-pink-500 to-red-400';
    if (level >= 4) return 'from-blue-400 via-indigo-500 to-purple-500';
    return 'from-green-400 via-emerald-500 to-teal-500';
  };

  if (!is_visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Sparkle particles */}
        {showSparkles && Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping pointer-events-none"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.5 + Math.random() * 1}s`
            }}
          />
        ))}
        
        {/* Radial gradient backdrop */}
        <div 
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            animationPhase === 'celebration' 
              ? "bg-gradient-radial from-yellow-400/20 via-transparent to-transparent opacity-100"
              : "opacity-0"
          )}
        />
      </div>

      {/* Main Level Up Display */}
      <Card 
        className={cn(
          "relative bg-white/95 backdrop-blur-md border-4 border-yellow-300 shadow-2xl pointer-events-auto",
          "transform transition-all duration-1000 ease-out",
          animationPhase === 'hidden' && "scale-0 opacity-0 translate-y-20 rotate-12",
          animationPhase === 'rising' && "scale-90 opacity-80 translate-y-4 rotate-3",
          animationPhase === 'celebration' && "scale-100 opacity-100 translate-y-0 rotate-0",
          animationPhase === 'complete' && "scale-95 opacity-70 translate-y-2",
          className
        )}
      >
        <CardContent className="p-8 text-center">
          {/* Level Up Header */}
          <div className="mb-6">
            <div className={cn(
              "inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 shadow-lg",
              "bg-gradient-to-br border-4 border-white",
              getLevelColor(level_data.new_level),
              animationPhase === 'celebration' && "animate-pulse"
            )}>
              {getLevelIcon(level_data.new_level)}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              LEVEL UP!
            </h1>
            
            <p className="text-xl text-gray-600">
              You&apos;ve reached level {level_data.new_level}!
            </p>
          </div>

          {/* Level Transition Display */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Previous Level */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-2xl font-bold text-gray-500">
                {level_data.previous_level}
              </div>
              <div className="text-sm text-gray-500">Previous</div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <ChevronUp className={cn(
                "w-8 h-8 text-green-600 transition-transform duration-1000",
                animationPhase === 'celebration' && "animate-bounce"
              )} />
            </div>

            {/* New Level */}
            <div className="text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-2 text-2xl font-bold text-white shadow-lg",
                "bg-gradient-to-br",
                getLevelColor(level_data.new_level),
                animationPhase === 'celebration' && "animate-pulse"
              )}>
                {level_data.new_level}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {level_data.level_name}
              </div>
            </div>
          </div>

          {/* XP Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Experience Points</span>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                +{level_data.xp_gained.toLocaleString()} XP
              </div>
              <div className="text-sm text-gray-600">
                Total: {level_data.total_xp.toLocaleString()} XP
              </div>
              
              {level_data.next_level_xp_required && (
                <div className="text-xs text-gray-500 mt-1">
                  Next level: {level_data.next_level_xp_required.toLocaleString()} XP needed
                </div>
              )}
            </div>
          </div>

          {/* Unlocked Features */}
          {level_data.unlocked_features && level_data.unlocked_features.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">New Features Unlocked!</span>
              </div>
              
              <div className="space-y-2">
                {level_data.unlocked_features.map((feature, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center justify-center gap-2 text-sm text-green-700 font-medium",
                      "transform transition-all duration-300",
                      animationPhase === 'celebration' && "animate-pulse"
                    )}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <Star className="w-4 h-4 text-green-600" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={on_complete}
            size="lg"
            className={cn(
              "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600",
              "transform transition-all duration-300 hover:scale-105 shadow-lg min-w-[140px]",
              animationPhase === 'celebration' && "animate-pulse"
            )}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Celebrate!
          </Button>

          {/* Progress Indicator */}
          <div className="mt-4 text-xs text-gray-500">
            Click to continue your coding journey
          </div>
        </CardContent>
      </Card>

      {/* Floating Achievement Particles */}
      {animationPhase === 'celebration' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: '2s'
              }}
            >
              <div className="w-8 h-8 text-yellow-400 transform rotate-12">
                <Star className="w-full h-full fill-current" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}