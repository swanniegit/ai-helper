'use client';

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  User, 
  Shirt, 
  Glasses, 
  Crown,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Award,
  Sparkles
} from 'lucide-react';
import { UserAvatar, type AvatarCustomization as AvatarCustomizationType } from '../../types/gamification';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import AvatarDisplay from './AvatarDisplay';

interface AvatarCustomizationProps {
  user_id: string;
  on_save?: (avatar: UserAvatar) => void;
  on_close?: () => void;
}

const AvatarCustomization: React.FC<AvatarCustomizationProps> = ({
  user_id,
  on_save,
  on_close
}) => {
  const [avatarData, setAvatarData] = useState<{
    avatar: UserAvatar;
    unlocked_items: any[];
    available_items: any[];
    avatar_stats: any;
  } | null>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [currentCustomization, setCurrentCustomization] = useState<AvatarCustomizationType | null>(null);
  const [avatarName, setAvatarName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  useEffect(() => {
    fetchAvatarData();
    fetchPresets();
  }, [user_id]);

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
        setCurrentCustomization(result.data.avatar.customization);
        setAvatarName(result.data.avatar.avatar_name);
      }
    } catch (err) {
      console.error('Avatar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/avatar/presets', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPresets(result.data);
        }
      }
    } catch (err) {
      console.error('Presets fetch error:', err);
    }
  };

  const handleCustomizationChange = (category: string, value: string) => {
    if (!currentCustomization) return;

    const updated = { ...currentCustomization };
    
    if (category === 'accessories') {
      // Handle accessories as array
      const currentAccessories = updated.accessories || [];
      if (currentAccessories.includes(value)) {
        updated.accessories = currentAccessories.filter(acc => acc !== value);
      } else {
        updated.accessories = [...currentAccessories, value];
      }
    } else {
      (updated as any)[category] = value;
    }

    setCurrentCustomization(updated);
  };

  const handlePresetApply = async (presetKey: string) => {
    try {
      const response = await fetch('/api/avatar/apply-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ preset_key: presetKey })
      });

      if (!response.ok) {
        throw new Error('Failed to apply preset');
      }

      const result = await response.json();
      if (result.success) {
        setCurrentCustomization(result.data.customization);
        await fetchAvatarData();
      }
    } catch (err) {
      console.error('Apply preset error:', err);
      alert(err instanceof Error ? err.message : 'Failed to apply preset');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/avatar/customize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          customization: currentCustomization,
          avatar_name: avatarName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save avatar');
      }

      const result = await response.json();
      if (result.success) {
        on_save?.(result.data);
        await fetchAvatarData();
      }
    } catch (err) {
      console.error('Save avatar error:', err);
      alert(err instanceof Error ? err.message : 'Failed to save avatar');
    } finally {
      setSaving(false);
    }
  };

  const getItemsByCategory = (category: string) => {
    if (!avatarData) return [];
    return avatarData.unlocked_items.filter(item => item.item_category === category);
  };

  const isItemSelected = (category: string, itemKey: string) => {
    if (!currentCustomization) return false;
    
    if (category === 'accessories') {
      return currentCustomization.accessories?.includes(itemKey) || false;
    }
    
    return (currentCustomization as any)[category] === itemKey;
  };

  const renderCustomizationOptions = (category: string, icon: React.ReactNode, title: string) => {
    const items = getItemsByCategory(category);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <button
              key={item.item_key}
              onClick={() => handleCustomizationChange(category, item.item_key)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                isItemSelected(category, item.item_key)
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{item.item_name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {item.item_data.rarity && (
                  <span className="capitalize">{item.item_data.rarity}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!avatarData || !currentCustomization) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Failed to load avatar data</p>
          <Button onClick={fetchAvatarData} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            Customize Avatar
          </h2>
          <p className="text-gray-600 text-sm">
            Personalize your DevPath Chronicles character
          </p>
        </div>
        
        {on_close && (
          <Button onClick={on_close} variant="outline">
            Close
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-gray-900">Preview</h3>
              
              {/* Avatar Display */}
              <AvatarDisplay
                avatar={{
                  ...avatarData.avatar,
                  customization: currentCustomization,
                  avatar_name: avatarName
                }}
                size="large"
                show_level={true}
                show_title={true}
              />

              {/* Avatar Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Avatar Name</label>
                <input
                  type="text"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="My Avatar"
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Customization Options */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="p-6 space-y-6">
                {renderCustomizationOptions('hair_style', <User className="w-4 h-4" />, 'Hair Style')}
                {renderCustomizationOptions('hair_color', <Palette className="w-4 h-4" />, 'Hair Color')}
                {renderCustomizationOptions('clothing_style', <Shirt className="w-4 h-4" />, 'Clothing Style')}
                {renderCustomizationOptions('accessories', <Glasses className="w-4 h-4" />, 'Accessories')}
                {renderCustomizationOptions('background_theme', <Eye className="w-4 h-4" />, 'Background')}
              </Card>
            </TabsContent>

            {/* Presets Tab */}
            <TabsContent value="presets" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="font-semibold text-gray-900">Avatar Presets</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{preset.preset_name}</h4>
                          <p className="text-sm text-gray-600">{preset.preset_description}</p>
                          {preset.required_level > 1 && (
                            <p className="text-xs text-amber-600 mt-1">
                              Requires Level {preset.required_level}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => handlePresetApply(preset.preset_key)}
                          variant="outline"
                          size="sm"
                          disabled={avatarData.avatar_stats.avatar_level < preset.required_level}
                        >
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <h3 className="font-semibold text-gray-900">Avatar Statistics</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {avatarData.avatar_stats.avatar_level}
                      </div>
                      <div className="text-sm text-gray-600">Avatar Level</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {avatarData.avatar_stats.total_xp.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total XP</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {avatarData.unlocked_items.length}
                      </div>
                      <div className="text-sm text-gray-600">Items Unlocked</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {avatarData.available_items.length - avatarData.unlocked_items.length}
                      </div>
                      <div className="text-sm text-gray-600">Items to Unlock</div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Privacy Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={avatarData.avatar.show_in_leaderboard}
                          onChange={() => {/* Handle privacy settings */}}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Show avatar in leaderboards</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={avatarData.avatar.show_achievements}
                          onChange={() => {/* Handle privacy settings */}}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Show achievements publicly</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomization;