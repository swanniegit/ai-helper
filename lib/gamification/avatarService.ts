import { supabase } from '../supabase';
import { 
  UserAvatar, 
  AvatarCustomization,
  CustomizeAvatarRequest,
  AvatarType
} from '../../types/gamification';

export class AvatarService {
  /**
   * Get user's complete avatar data with customization and unlocked items
   */
  static async getUserAvatar(userId: string): Promise<{
    avatar: UserAvatar;
    unlocked_items: Array<{
      id: string;
      item_key: string;
      item_name: string;
      item_category: string;
      item_data: any;
      unlocked_at: string;
    }>;
    available_items: Array<{
      id: string;
      item_key: string;
      item_name: string;
      item_category: string;
      item_data: any;
      rarity: string;
      required_level: number;
      required_xp: number;
      can_unlock: boolean;
    }>;
    avatar_stats: {
      avatar_level: number;
      total_xp: number;
      unlocked_items_count: number;
      active_title?: {
        title_name: string;
        title_color: string;
        title_rarity: string;
        title_icon: string;
      };
    };
  }> {
    try {
      // Get user's avatar data
      const { data: avatarData, error: avatarError } = await supabase
        .from('user_avatar_complete')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (avatarError && avatarError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch avatar: ${avatarError.message}`);
      }

      // If no avatar exists, create default avatar
      if (!avatarData) {
        const defaultAvatar = await AvatarService.createDefaultAvatar(userId);
        return AvatarService.getUserAvatar(userId); // Recursive call to get the new avatar
      }

      // Get unlocked cosmetic items
      const { data: unlockedItems, error: unlockedError } = await supabase
        .from('user_avatar_items')
        .select(`
          id,
          unlocked_at,
          unlock_method,
          avatar_cosmetic_items!inner(
            id,
            item_key,
            item_name,
            item_category,
            item_data,
            rarity
          )
        `)
        .eq('user_id', userId);

      if (unlockedError) {
        throw new Error(`Failed to fetch unlocked items: ${unlockedError.message}`);
      }

      // Get all available cosmetic items with unlock status
      const { data: availableItems, error: availableError } = await supabase
        .rpc('get_user_cosmetic_items_status', { p_user_id: userId });

      if (availableError) {
        throw new Error(`Failed to fetch available items: ${availableError.message}`);
      }

      // Format unlocked items
      const formattedUnlockedItems = (unlockedItems || []).map(item => ({
        id: item.avatar_cosmetic_items.id,
        item_key: item.avatar_cosmetic_items.item_key,
        item_name: item.avatar_cosmetic_items.item_name,
        item_category: item.avatar_cosmetic_items.item_category,
        item_data: item.avatar_cosmetic_items.item_data,
        unlocked_at: item.unlocked_at
      }));

      // Calculate avatar stats
      const avatarStats = {
        avatar_level: avatarData.calculated_avatar_level || 1,
        total_xp: avatarData.total_xp || 0,
        unlocked_items_count: avatarData.unlocked_items_count || 0,
        active_title: avatarData.active_title
      };

      return {
        avatar: avatarData,
        unlocked_items: formattedUnlockedItems,
        available_items: availableItems || [],
        avatar_stats: avatarStats
      };

    } catch (error) {
      console.error('Get user avatar error:', error);
      throw error;
    }
  }

  /**
   * Create default avatar for new user
   */
  static async createDefaultAvatar(userId: string): Promise<UserAvatar> {
    try {
      // Get beginner developer preset
      const { data: preset, error: presetError } = await supabase
        .from('avatar_presets')
        .select('*')
        .eq('preset_key', 'beginner_dev')
        .single();

      if (presetError) {
        throw new Error(`Failed to fetch default preset: ${presetError.message}`);
      }

      // Create avatar with default customization
      const { data: newAvatar, error: createError } = await supabase
        .from('user_avatars')
        .insert({
          user_id: userId,
          avatar_name: 'My Avatar',
          avatar_title: null,
          customization: preset.default_customization,
          avatar_level: 1,
          avatar_xp: 0,
          unlocked_items: [],
          is_active: true,
          show_in_leaderboard: true,
          show_achievements: true
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create avatar: ${createError.message}`);
      }

      // Unlock default cosmetic items
      await AvatarService.unlockDefaultItems(userId);

      return newAvatar;

    } catch (error) {
      console.error('Create default avatar error:', error);
      throw error;
    }
  }

  /**
   * Customize user's avatar
   */
  static async customizeAvatar(
    userId: string,
    request: CustomizeAvatarRequest
  ): Promise<UserAvatar> {
    try {
      // Get current avatar
      const { data: currentAvatar, error: fetchError } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch current avatar: ${fetchError.message}`);
      }

      // Merge customization changes
      const updatedCustomization = {
        ...currentAvatar.customization,
        ...request.customization
      };

      // Update avatar
      const updates: Partial<UserAvatar> = {
        customization: updatedCustomization,
        updated_at: new Date().toISOString()
      };

      if (request.avatar_name) {
        updates.avatar_name = request.avatar_name;
      }

      const { data: updatedAvatar, error: updateError } = await supabase
        .from('user_avatars')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update avatar: ${updateError.message}`);
      }

      return updatedAvatar;

    } catch (error) {
      console.error('Customize avatar error:', error);
      throw error;
    }
  }

  /**
   * Unlock cosmetic item for user
   */
  static async unlockCosmeticItem(
    userId: string,
    itemId: string,
    unlockMethod: string = 'purchase'
  ): Promise<boolean> {
    try {
      // Check if item is already unlocked
      const { data: existingItem, error: checkError } = await supabase
        .from('user_avatar_items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing item: ${checkError.message}`);
      }

      if (existingItem) {
        return false; // Already unlocked
      }

      // Get item details to check requirements
      const { data: item, error: itemError } = await supabase
        .from('avatar_cosmetic_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) {
        throw new Error(`Failed to fetch item: ${itemError.message}`);
      }

      // Check if user meets requirements
      const { data: userXP, error: xpError } = await supabase
        .from('user_xp')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .single();

      if (xpError && xpError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch user XP: ${xpError.message}`);
      }

      const currentXP = userXP?.total_xp || 0;
      const currentLevel = AvatarService.getNumericLevel(userXP?.current_level || 'Code Apprentice');

      // Check requirements
      if (currentXP < item.required_xp || currentLevel < item.required_level) {
        throw new Error('Requirements not met to unlock this item');
      }

      // Unlock the item
      const { error: unlockError } = await supabase
        .from('user_avatar_items')
        .insert({
          user_id: userId,
          item_id: itemId,
          unlock_method: unlockMethod
        });

      if (unlockError) {
        throw new Error(`Failed to unlock item: ${unlockError.message}`);
      }

      return true;

    } catch (error) {
      console.error('Unlock cosmetic item error:', error);
      throw error;
    }
  }

  /**
   * Get avatar presets
   */
  static async getAvatarPresets(): Promise<Array<{
    id: string;
    preset_key: string;
    preset_name: string;
    preset_description: string;
    avatar_type: AvatarType;
    default_customization: AvatarCustomization;
    required_level: number;
    required_skills: string[];
    is_starter_preset: boolean;
  }>> {
    try {
      const { data: presets, error } = await supabase
        .from('avatar_presets')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch presets: ${error.message}`);
      }

      return presets || [];

    } catch (error) {
      console.error('Get avatar presets error:', error);
      throw error;
    }
  }

  /**
   * Apply avatar preset to user
   */
  static async applyAvatarPreset(
    userId: string,
    presetKey: string
  ): Promise<UserAvatar> {
    try {
      // Get preset
      const { data: preset, error: presetError } = await supabase
        .from('avatar_presets')
        .select('*')
        .eq('preset_key', presetKey)
        .single();

      if (presetError) {
        throw new Error(`Failed to fetch preset: ${presetError.message}`);
      }

      // Apply preset customization
      return AvatarService.customizeAvatar(userId, {
        customization: preset.default_customization
      });

    } catch (error) {
      console.error('Apply avatar preset error:', error);
      throw error;
    }
  }

  /**
   * Get user's avatar titles
   */
  static async getUserAvatarTitles(userId: string): Promise<Array<{
    id: string;
    title_key: string;
    title_name: string;
    title_description: string;
    title_color: string;
    title_rarity: string;
    title_icon: string;
    earned_at: string;
    is_active: boolean;
  }>> {
    try {
      const { data: titles, error } = await supabase
        .from('user_avatar_titles')
        .select(`
          id,
          earned_at,
          is_active,
          avatar_titles!inner(
            id,
            title_key,
            title_name,
            title_description,
            title_color,
            title_rarity,
            title_icon
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user titles: ${error.message}`);
      }

      return (titles || []).map(title => ({
        id: title.id,
        title_key: title.avatar_titles.title_key,
        title_name: title.avatar_titles.title_name,
        title_description: title.avatar_titles.title_description,
        title_color: title.avatar_titles.title_color,
        title_rarity: title.avatar_titles.title_rarity,
        title_icon: title.avatar_titles.title_icon,
        earned_at: title.earned_at,
        is_active: title.is_active
      }));

    } catch (error) {
      console.error('Get user avatar titles error:', error);
      throw error;
    }
  }

  /**
   * Set active avatar title
   */
  static async setActiveAvatarTitle(
    userId: string,
    titleId: string
  ): Promise<boolean> {
    try {
      // Deactivate all current titles
      await supabase
        .from('user_avatar_titles')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Activate the selected title
      const { error: activateError } = await supabase
        .from('user_avatar_titles')
        .update({ is_active: true })
        .eq('user_id', userId)
        .eq('id', titleId);

      if (activateError) {
        throw new Error(`Failed to activate title: ${activateError.message}`);
      }

      return true;

    } catch (error) {
      console.error('Set active avatar title error:', error);
      throw error;
    }
  }

  /**
   * Update avatar XP and level
   */
  static async updateAvatarXP(userId: string, xpGained: number): Promise<void> {
    try {
      const { data: currentAvatar, error: fetchError } = await supabase
        .from('user_avatars')
        .select('avatar_xp, avatar_level')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch avatar: ${fetchError.message}`);
      }

      if (!currentAvatar) {
        await AvatarService.createDefaultAvatar(userId);
        return AvatarService.updateAvatarXP(userId, xpGained);
      }

      const newAvatarXP = (currentAvatar.avatar_xp || 0) + xpGained;
      const newAvatarLevel = AvatarService.calculateAvatarLevel(newAvatarXP);

      await supabase
        .from('user_avatars')
        .update({
          avatar_xp: newAvatarXP,
          avatar_level: newAvatarLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Check for new item unlocks if level increased
      if (newAvatarLevel > (currentAvatar.avatar_level || 1)) {
        await supabase.rpc('unlock_cosmetic_items_for_user', { p_user_id: userId });
      }

    } catch (error) {
      console.error('Update avatar XP error:', error);
    }
  }

  /**
   * Helper: Calculate avatar level from XP
   */
  private static calculateAvatarLevel(avatarXP: number): number {
    if (avatarXP >= 5000) return 10;
    if (avatarXP >= 4000) return 9;
    if (avatarXP >= 3200) return 8;
    if (avatarXP >= 2500) return 7;
    if (avatarXP >= 1900) return 6;
    if (avatarXP >= 1400) return 5;
    if (avatarXP >= 1000) return 4;
    if (avatarXP >= 700) return 3;
    if (avatarXP >= 400) return 2;
    return 1;
  }

  /**
   * Helper: Convert DevLevel to numeric value
   */
  private static getNumericLevel(devLevel: string): number {
    const levelMap = {
      'Code Apprentice': 1,
      'Bug Hunter': 2,
      'Logic Architect': 3,
      'Code Wizard': 4,
      'Dev Sage': 5
    };
    
    return levelMap[devLevel as keyof typeof levelMap] || 1;
  }

  /**
   * Helper: Unlock default cosmetic items for new user
   */
  private static async unlockDefaultItems(userId: string): Promise<void> {
    try {
      // Get all default items
      const { data: defaultItems, error } = await supabase
        .from('avatar_cosmetic_items')
        .select('id')
        .eq('is_default', true)
        .eq('is_active', true);

      if (error) {
        console.error('Failed to fetch default items:', error);
        return;
      }

      // Unlock each default item
      for (const item of defaultItems || []) {
        await supabase
          .from('user_avatar_items')
          .insert({
            user_id: userId,
            item_id: item.id,
            unlock_method: 'default'
          })
          .select()
          .single();
      }

    } catch (error) {
      console.error('Unlock default items error:', error);
    }
  }
}