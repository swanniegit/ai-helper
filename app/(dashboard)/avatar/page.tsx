'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Crown, 
  Star, 
  Award,
  Palette,
  Settings,
  Sparkles,
  TrendingUp
} from 'lucide-react';

// Avatar Components
import AvatarDisplay from '@/components/gamification/AvatarDisplay';
import AvatarCustomization from '@/components/gamification/AvatarCustomization';
import { UserAvatar } from '@/types/gamification';

export default function AvatarPage() {
  const [avatarData, setAvatarData] = useState<{
    avatar: UserAvatar;
    unlocked_items: any[];
    available_items: any[];
    avatar_stats: any;
  } | null>(null);
  const [userTitles, setUserTitles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    fetchAvatarData();
    fetchUserTitles();
  }, []);

  const fetchAvatarData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/avatar', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch avatar data');
      }

      const result = await response.json();
      if (result.success) {
        setAvatarData(result.data);
      }
    } catch (err) {
      console.error('Avatar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTitles = async () => {
    try {
      const response = await fetch('/api/avatar/titles', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserTitles(result.data);
        }
      }
    } catch (err) {
      console.error('Titles fetch error:', err);
    }
  };

  const handleAvatarSave = (updatedAvatar: UserAvatar) => {
    if (avatarData) {
      setAvatarData({
        ...avatarData,
        avatar: updatedAvatar
      });
    }
    setShowCustomization(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'uncommon': return 'bg-green-100';
      case 'rare': return 'bg-blue-100';
      case 'epic': return 'bg-purple-100';
      case 'legendary': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
        <div className="animate-pulse">
          <div className="bg-card/10 backdrop-blur-sm rounded-lg border border-border/20 p-6 shadow-lg">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (showCustomization) {
    return (
      <div className="min-h-screen bg-gradient-metro p-6">
        <AvatarCustomization
          user_id="current"
          on_save={handleAvatarSave}
          on_close={() => setShowCustomization(false)}
        />
      </div>
    );
  }

  if (!avatarData) {
    return (
      <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
        <Card className="p-6">
          <div className="text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Failed to load avatar data</p>
            <Button onClick={fetchAvatarData} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
      {/* Header */}
      <div className="bg-card/10 backdrop-blur-sm rounded-lg border border-border/20 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              My Avatar
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Customize your DevPath Chronicles character and showcase your achievements
            </p>
          </div>
          
          <Button
            onClick={() => setShowCustomization(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <Palette className="w-4 h-4 mr-2" />
            Customize Avatar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Display */}
        <div className="space-y-6">
          <Card className="p-6">
            <AvatarDisplay
              avatar={avatarData.avatar}
              size="large"
              show_level={true}
              show_title={true}
              interactive={true}
              on_customize={() => setShowCustomization(true)}
            />
          </Card>

          {/* Avatar Stats */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Avatar Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {avatarData.avatar_stats.avatar_level}
                  </div>
                  <div className="text-sm text-gray-600">Avatar Level</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {avatarData.avatar_stats.total_xp.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total XP</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {avatarData.unlocked_items.length}
                  </div>
                  <div className="text-sm text-gray-600">Items Owned</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {userTitles.length}
                  </div>
                  <div className="text-sm text-gray-600">Titles Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Avatar Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unlocked Items */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Unlocked Items ({avatarData.unlocked_items.length})
              </CardTitle>
              <CardDescription>
                Cosmetic items you&apos;ve unlocked for your avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {avatarData.unlocked_items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No items unlocked yet</p>
                  <p className="text-sm">Level up to unlock new cosmetic items!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {avatarData.unlocked_items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border-2 ${getRarityBg(item.item_data.rarity || 'common')} border-gray-200`}
                    >
                      <div className="font-medium text-sm">{item.item_name}</div>
                      <div className={`text-xs capitalize font-medium ${getRarityColor(item.item_data.rarity || 'common')}`}>
                        {item.item_data.rarity || 'common'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.item_category.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Avatar Titles */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Earned Titles ({userTitles.length})
              </CardTitle>
              <CardDescription>
                Special titles earned through achievements and progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userTitles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No titles earned yet</p>
                  <p className="text-sm">Complete achievements to earn special titles!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTitles.map((title) => (
                    <div
                      key={title.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        title.is_active ? 'border-primary bg-primary/10' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-${title.title_color}-100`}>
                          <Award className={`w-4 h-4 text-${title.title_color}-600`} />
                        </div>
                        <div>
                          <div className="font-medium">{title.title_name}</div>
                          <div className="text-sm text-gray-600">{title.title_description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRarityColor(title.title_rarity)} ${getRarityBg(title.title_rarity)}`}>
                          {title.title_rarity}
                        </span>
                        {title.is_active && (
                          <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Items to Unlock */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Items to Unlock ({avatarData.available_items.length - avatarData.unlocked_items.length})
              </CardTitle>
              <CardDescription>
                Cosmetic items you can unlock by leveling up and earning achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {avatarData.available_items
                  .filter(item => !avatarData.unlocked_items.some(unlocked => unlocked.id === item.id))
                  .slice(0, 6)
                  .map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-75`}
                  >
                    <div className="font-medium text-sm">{item.item_name}</div>
                    <div className={`text-xs capitalize font-medium ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Requires Level {item.required_level}
                    </div>
                  </div>
                ))}
              </div>
              
              {avatarData.available_items.length - avatarData.unlocked_items.length > 6 && (
                <div className="text-center mt-4">
                  <Button
                    onClick={() => setShowCustomization(true)}
                    variant="outline"
                  >
                    View All Available Items
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}