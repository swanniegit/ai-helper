'use client';

import React, { useEffect, useState } from 'react';
import { X, Star, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { LevelUpModalProps } from '../../types/gamification';
import { Dialog } from '../ui/dialog';
import BadgeDisplay from './BadgeDisplay';

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  old_level,
  new_level,
  xp_gained,
  achievements_unlocked = [],
  onClose,
  isOpen
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger celebration animation
      setTimeout(() => setShowCelebration(true), 200);
      // Show content after celebration
      setTimeout(() => setShowContent(true), 800);
    } else {
      setShowCelebration(false);
      setShowContent(false);
    }
  }, [isOpen]);

  // Level color scheme
  const getLevelColor = (level: string) => {
    const colors = {
      'Code Apprentice': 'from-gray-400 to-gray-600',
      'Bug Hunter': 'from-green-400 to-green-600',
      'Logic Architect': 'from-blue-400 to-blue-600',
      'Code Wizard': 'from-purple-400 to-purple-600',
      'Dev Sage': 'from-yellow-400 to-yellow-600'
    };
    return colors[level as keyof typeof colors] || 'from-primary to-gray-700';
  };

  const newLevelGradient = getLevelColor(new_level);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-500 ${
          showCelebration ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          
          {/* Celebration Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${newLevelGradient} opacity-10`} />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="relative p-8 text-center">
            
            {/* Crown Icon with Animation */}
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${newLevelGradient} rounded-full mb-6 transition-all duration-700 ${
              showCelebration ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              <Crown className="w-10 h-10 text-white" />
              
              {/* Sparkles around crown */}
              {showCelebration && (
                <>
                  <div className="absolute -top-2 -left-2 animate-bounce animation-delay-200">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 animate-bounce animation-delay-500">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 animate-bounce animation-delay-700">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>
                </>
              )}
            </div>

            {/* Level Up Text */}
            <div className={`transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Level Up! 🎉
              </h1>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">You&apos;ve advanced from</p>
                <div className="flex items-center justify-center gap-2 text-lg">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                    {old_level}
                  </span>
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className={`px-3 py-1 bg-gradient-to-r ${newLevelGradient} text-white rounded-full font-bold`}>
                    {new_level}
                  </span>
                </div>
              </div>

              {/* XP Gained */}
              <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-primary/10 rounded-lg">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-primary font-bold">
                  +{xp_gained} XP Gained
                </span>
              </div>

              {/* New Achievements */}
              {achievements_unlocked.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🏆 New Achievements Unlocked!
                  </h3>
                  <div className="space-y-2">
                    {achievements_unlocked.map((achievement) => (
                      <div key={achievement.id} className="text-left">
                        {achievement.badge && (
                          <BadgeDisplay
                            badge={achievement.badge}
                            is_earned={true}
                            earned_date={achievement.earned_at}
                            show_description={false}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-primary to-gray-700 text-white font-semibold rounded-lg hover:from-primary/90 hover:to-gray-700/90 transition-all duration-200 transform hover:scale-105"
              >
                Continue Your Journey
              </button>
            </div>
          </div>

          {/* Animated Border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-yellow-400 via-primary to-purple-400 opacity-20 animate-pulse" style={{
            background: 'linear-gradient(90deg, transparent, transparent)',
            backgroundSize: '200% 100%',
            animation: 'gradient-x 3s ease infinite'
          }} />

          {/* Floating Particles */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    animationDelay: `${i * 200}ms`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default LevelUpModal;