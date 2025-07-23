'use client';

import React, { useState } from 'react';
import { 
  User, 
  Crown, 
  Star, 
  Settings, 
  Palette,
  Award,
  Zap
} from 'lucide-react';
import { AvatarDisplayProps, UserAvatar, AvatarCustomization } from '../../types/gamification';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  size = 'medium',
  show_level = true,
  show_title = true,
  interactive = false,
  on_customize
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      containerSize: 'w-16 h-16',
      fontSize: 'text-xs',
      padding: 'p-2',
      titleSize: 'text-xs',
      levelSize: 'text-xs'
    },
    medium: {
      containerSize: 'w-24 h-24',
      fontSize: 'text-sm',
      padding: 'p-3',
      titleSize: 'text-sm',
      levelSize: 'text-sm'
    },
    large: {
      containerSize: 'w-32 h-32',
      fontSize: 'text-base',
      padding: 'p-4',
      titleSize: 'text-base',
      levelSize: 'text-base'
    }
  };

  const config = sizeConfig[size];
  const customization = avatar.customization as AvatarCustomization;

  // Generate avatar appearance based on customization
  const getAvatarStyle = () => {
    // This would normally generate CSS styles based on customization data
    // For now, we'll create a simplified version
    const styles: any = {};
    
    if (customization.background_theme) {
      const bgThemes = {
        'office_bg': 'bg-gradient-to-br from-gray-100 to-gray-200',
        'home_bg': 'bg-gradient-to-br from-yellow-100 to-orange-100',
        'cafe_bg': 'bg-gradient-to-br from-amber-100 to-brown-100',
        'nature_bg': 'bg-gradient-to-br from-green-100 to-emerald-100',
        'space_bg': 'bg-gradient-to-br from-purple-900 to-indigo-900'
      };
      styles.background = bgThemes[customization.background_theme as keyof typeof bgThemes] || bgThemes.office_bg;
    }

    return styles;
  };

  const getAvatarInitials = () => {
    return avatar.avatar_name.substring(0, 2).toUpperCase();
  };

  const getAvatarEmoji = () => {
    // Generate emoji based on avatar type and customization
    const avatarTypeEmojis = {
      'developer': '👨‍💻',
      'architect': '👨‍🔧',
      'specialist': '🧙‍♂️',
      'mentor': '👨‍🏫'
    };

    return avatarTypeEmojis[customization.avatar_type as keyof typeof avatarTypeEmojis] || '👨‍💻';
  };

  const getLevelColor = () => {
    if (avatar.avatar_level >= 8) return 'text-purple-600';
    if (avatar.avatar_level >= 6) return 'text-blue-600';
    if (avatar.avatar_level >= 4) return 'text-green-600';
    if (avatar.avatar_level >= 2) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTitleStyle = () => {
    if (!avatar.avatar_title) return {};
    
    // This would be populated from the active title data
    return {
      color: '#6366f1' // Default purple
    };
  };

  const avatarStyle = getAvatarStyle();

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Avatar Container */}
      <div
        className={`relative ${config.containerSize} ${avatarStyle.background || 'bg-gradient-to-br from-gray-100 to-gray-200'} 
          rounded-full border-4 border-white shadow-lg overflow-hidden transition-transform duration-200 
          ${interactive ? 'cursor-pointer hover:scale-105' : ''}
          ${isHovered ? 'ring-4 ring-primary/20' : ''}`}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
        onClick={() => interactive && on_customize?.()}
      >
        {/* Avatar Character */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${config.fontSize === 'text-xs' ? 'text-2xl' : 
                          config.fontSize === 'text-sm' ? 'text-3xl' : 'text-4xl'}`}>
            {getAvatarEmoji()}
          </div>
        </div>

        {/* Accessories Overlay */}
        {customization.accessories && customization.accessories.includes('glasses') && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs opacity-80">👓</div>
          </div>
        )}

        {customization.accessories && customization.accessories.includes('wizard_hat') && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="text-lg">🎩</div>
          </div>
        )}

        {customization.accessories && customization.accessories.includes('crown') && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="text-lg">👑</div>
          </div>
        )}

        {/* Level Badge */}
        {show_level && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-primary to-gray-700 text-white ${config.levelSize} font-bold`}>
              <Star className="w-3 h-3" />
              <span>{avatar.avatar_level}</span>
            </div>
          </div>
        )}

        {/* Customize Button Overlay */}
        {interactive && isHovered && on_customize && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Palette className="w-4 h-4 text-gray-700" />
            </div>
          </div>
        )}
      </div>

      {/* Avatar Name */}
      <div className="text-center">
        <h3 className={`font-semibold text-gray-900 ${config.titleSize}`}>
          {avatar.avatar_name}
        </h3>
        
        {/* Avatar Title */}
        {show_title && avatar.avatar_title && (
          <div 
            className={`font-medium ${config.fontSize} opacity-80`}
            style={getTitleStyle()}
          >
            {avatar.avatar_title}
          </div>
        )}
      </div>

      {/* Avatar Stats (Large size only) */}
      {size === 'large' && (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className={`font-bold text-gray-900 ${getLevelColor()}`}>
              Level {avatar.avatar_level}
            </div>
            <div className="text-xs text-gray-500">Avatar Level</div>
          </div>
          
          <div>
            <div className="font-bold text-gray-900">
              {avatar.avatar_xp.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Avatar XP</div>
          </div>
          
          <div>
            <div className="font-bold text-gray-900">
              {avatar.unlocked_items.length}
            </div>
            <div className="text-xs text-gray-500">Items Unlocked</div>
          </div>
          
          <div>
            <div className="font-bold text-gray-900">
              {avatar.show_achievements ? 'Public' : 'Private'}
            </div>
            <div className="text-xs text-gray-500">Profile</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {interactive && size !== 'small' && (
        <div className="flex gap-2">
          {on_customize && (
            <Button
              onClick={on_customize}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span className="hidden sm:inline">Customize</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;