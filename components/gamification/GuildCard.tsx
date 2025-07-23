'use client';

import React, { useState } from 'react';
import { Users, Crown, Shield, Zap, Globe, Lock, Star, TrendingUp } from 'lucide-react';
import { GuildCardProps } from '../../types/gamification';
import { Card } from '../ui/card';

const GuildCard: React.FC<GuildCardProps> = ({
  guild,
  user_membership,
  show_join_button = false,
  onJoin,
  onLeave
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinLeave = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (user_membership?.is_active) {
        await onLeave?.(guild.id);
      } else {
        await onJoin?.(guild.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getGuildTypeIcon = () => {
    switch (guild.guild_type) {
      case 'study_squad':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'skill_guild':
        return <Shield className="w-5 h-5 text-purple-500" />;
      case 'mentor_circle':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSkillFocusColor = () => {
    const colors = {
      php: 'from-purple-400 to-purple-600',
      oracle: 'from-red-400 to-red-600',
      general: 'from-primary to-gray-700',
      full_stack: 'from-blue-400 to-green-400'
    };
    return colors[guild.skill_focus] || colors.general;
  };

  const getGuildTypeLabel = () => {
    const labels = {
      study_squad: 'Study Squad',
      skill_guild: 'Skill Guild',
      mentor_circle: 'Mentor Circle'
    };
    return labels[guild.guild_type] || 'Guild';
  };

  const getSkillFocusLabel = () => {
    const labels = {
      php: 'PHP Development',
      oracle: 'Oracle Database',
      general: 'General Programming',
      full_stack: 'Full Stack Development'
    };
    return labels[guild.skill_focus] || guild.skill_focus;
  };

  const getMembershipStatus = () => {
    if (!user_membership) return null;
    
    const roleColors = {
      founder: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      leader: 'bg-purple-100 text-purple-800 border-purple-200',
      moderator: 'bg-blue-100 text-blue-800 border-blue-200',
      member: 'bg-green-100 text-green-800 border-green-200'
    };

    const roleLabels = {
      founder: 'Founder',
      leader: 'Leader',
      moderator: 'Moderator',
      member: 'Member'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        roleColors[user_membership.role] || roleColors.member
      }`}>
        {roleLabels[user_membership.role] || 'Member'}
      </span>
    );
  };

  const isAtCapacity = guild.current_members >= guild.max_members;
  const isMember = user_membership?.is_active;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header with Guild Type Badge */}
      <div className={`p-4 bg-gradient-to-r ${getSkillFocusColor()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getGuildTypeIcon()}
              <span className="text-white/90 text-sm font-medium">
                {getGuildTypeLabel()}
              </span>
              {!guild.is_public && (
                <Lock className="w-4 h-4 text-white/70" />
              )}
            </div>
            
            <h3 className="font-bold text-white text-lg mb-1 leading-tight">
              {guild.display_name}
            </h3>
            
            <p className="text-white/80 text-sm">
              {getSkillFocusLabel()}
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-white/90 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {guild.current_members}/{guild.max_members}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-white/80">
              <Star className="w-3 h-3" />
              <span className="text-xs">
                Level {guild.guild_level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        {guild.description && (
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {guild.description}
          </p>
        )}

        {/* Guild Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-gray-600">Guild XP</span>
            </div>
            <div className="font-bold text-lg text-gray-900">
              {guild.total_guild_xp.toLocaleString()}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-gray-600">Activity</span>
            </div>
            <div className="font-bold text-lg text-gray-900">
              {guild.current_members > 0 ? 'High' : 'Low'}
            </div>
          </div>
        </div>

        {/* Member Contribution (if user is a member) */}
        {isMember && user_membership && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Your Contribution</p>
                <p className="text-xs text-gray-600">
                  {user_membership.contribution_xp.toLocaleString()} XP contributed
                </p>
              </div>
              {getMembershipStatus()}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {guild.is_public ? (
              <div className="flex items-center gap-1 text-green-600">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">Public</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-medium">Private</span>
              </div>
            )}
            
            {isAtCapacity && !isMember && (
              <span className="text-xs text-red-600 font-medium">
                Full
              </span>
            )}
          </div>

          {show_join_button && (onJoin || onLeave) && (
            <button
              onClick={handleJoinLeave}
              disabled={isLoading || (!isMember && isAtCapacity)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isMember
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50'
                  : isAtCapacity
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90 disabled:opacity-50'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : isMember ? (
                'Leave Guild'
              ) : isAtCapacity ? (
                'Full'
              ) : (
                'Join Guild'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Member Progress Bar */}
      <div className="px-4 pb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${getSkillFocusColor()} transition-all duration-300`}
            style={{ width: `${(guild.current_members / guild.max_members) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{guild.current_members} members</span>
          <span>Capacity: {guild.max_members}</span>
        </div>
      </div>
    </Card>
  );
};

export default GuildCard;