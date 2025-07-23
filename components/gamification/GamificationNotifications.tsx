'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import CelebrationModal from './CelebrationModal';
import LevelUpAnimation from './LevelUpAnimation';

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

interface LevelUpData {
  previous_level: number;
  new_level: number;
  level_name: string;
  total_xp: number;
  xp_gained: number;
  unlocked_features?: string[];
  next_level_xp_required?: number;
}

interface NotificationContextType {
  showCelebration: (data: CelebrationData) => void;
  showLevelUp: (data: LevelUpData) => void;
  showXPGain: (xp: number, reason?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useGamificationNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useGamificationNotifications must be used within GamificationNotificationProvider');
  }
  return context;
};

interface XPNotification {
  id: string;
  xp: number;
  reason?: string;
  timestamp: number;
}

interface GamificationNotificationProviderProps {
  children: React.ReactNode;
}

export function GamificationNotificationProvider({ children }: GamificationNotificationProviderProps) {
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([]);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);

  // Auto-remove XP notifications after 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setXpNotifications(prev => 
        prev.filter(notification => now - notification.timestamp < 3000)
      );
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const showCelebration = (data: CelebrationData) => {
    setCelebrationData(data);
    setShowCelebrationModal(true);
  };

  const showLevelUp = (data: LevelUpData) => {
    setLevelUpData(data);
    setShowLevelUpAnimation(true);
  };

  const showXPGain = (xp: number, reason?: string) => {
    const notification: XPNotification = {
      id: `xp-${Date.now()}-${Math.random()}`,
      xp,
      reason,
      timestamp: Date.now()
    };
    
    setXpNotifications(prev => [...prev, notification]);
  };

  const closeCelebration = () => {
    setShowCelebrationModal(false);
    setCelebrationData(null);
  };

  const closeLevelUp = () => {
    setShowLevelUpAnimation(false);
    setLevelUpData(null);
  };

  return (
    <NotificationContext.Provider 
      value={{
        showCelebration,
        showLevelUp,
        showXPGain
      }}
    >
      {children}
      
      {/* XP Gain Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-2 pointer-events-none">
        {xpNotifications.map((notification) => (
          <XPNotification
            key={notification.id}
            xp={notification.xp}
            reason={notification.reason}
          />
        ))}
      </div>

      {/* Level Up Animation */}
      {levelUpData && (
        <LevelUpAnimation
          level_data={levelUpData}
          is_visible={showLevelUpAnimation}
          on_complete={closeLevelUp}
        />
      )}

      {/* Celebration Modal */}
      {celebrationData && (
        <CelebrationModal
          celebration_data={celebrationData}
          is_open={showCelebrationModal}
          on_close={closeCelebration}
        />
      )}
    </NotificationContext.Provider>
  );
}

interface XPNotificationProps {
  xp: number;
  reason?: string;
}

function XPNotification({ xp, reason }: XPNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 50);
    
    // Trigger exit animation
    setTimeout(() => setIsVisible(false), 2500);
  }, []);

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out pointer-events-auto
        ${isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg border border-green-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">XP</span>
          </div>
          <div>
            <div className="font-semibold text-sm">+{xp} XP</div>
            {reason && (
              <div className="text-xs text-green-100">{reason}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for common celebration patterns

export const createLevelUpCelebration = (
  previousLevel: number,
  newLevel: number,
  levelName: string,
  totalXP: number,
  xpGained: number,
  unlockedFeatures: string[] = []
): CelebrationData => ({
  celebration_type: 'level_up',
  title: 'Level Up!',
  description: `Congratulations! You've reached ${levelName}!`,
  rewards: [
    {
      type: 'level',
      name: levelName,
      description: `You are now level ${newLevel}`,
      value: newLevel
    },
    {
      type: 'xp',
      name: 'Experience Points',
      description: 'XP gained from your activities',
      value: xpGained
    },
    ...unlockedFeatures.map(feature => ({
      type: 'item' as const,
      name: 'New Feature',
      description: feature,
      rarity: 'uncommon' as const
    }))
  ],
  previous_level: previousLevel,
  new_level: newLevel,
  total_xp: totalXP
});

export const createQuestCompleteCelebration = (
  questName: string,
  xpReward: number,
  additionalRewards: CelebrationReward[] = []
): CelebrationData => ({
  celebration_type: 'quest_complete',
  title: 'Quest Complete!',
  description: `You have successfully completed "${questName}"`,
  rewards: [
    {
      type: 'xp',
      name: 'Quest XP',
      description: 'Experience gained from quest completion',
      value: xpReward
    },
    ...additionalRewards
  ],
  quest_name: questName
});

export const createAchievementCelebration = (
  achievementName: string,
  achievementDescription: string,
  xpReward: number = 0,
  additionalRewards: CelebrationReward[] = []
): CelebrationData => ({
  celebration_type: 'achievement_unlock',
  title: 'Achievement Unlocked!',
  description: achievementDescription,
  rewards: [
    {
      type: 'achievement',
      name: achievementName,
      description: achievementDescription,
      rarity: 'rare'
    },
    ...(xpReward > 0 ? [{
      type: 'xp' as const,
      name: 'Achievement Bonus',
      description: 'XP bonus for unlocking achievement',
      value: xpReward
    }] : []),
    ...additionalRewards
  ],
  achievement_name: achievementName
});

export const createSkillMasteryCelebration = (
  skillName: string,
  xpReward: number,
  additionalRewards: CelebrationReward[] = []
): CelebrationData => ({
  celebration_type: 'skill_mastery',
  title: 'Skill Mastery!',
  description: `You have mastered the ${skillName} skill!`,
  rewards: [
    {
      type: 'badge',
      name: `${skillName} Master`,
      description: `Master badge for ${skillName}`,
      rarity: 'epic'
    },
    {
      type: 'xp',
      name: 'Mastery Bonus',
      description: 'XP bonus for skill mastery',
      value: xpReward
    },
    ...additionalRewards
  ],
  skill_name: skillName
});