import { supabase } from '../supabaseClient';
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
      const formattedUnlockedItems = (unlockedItems || []).map((item: any) => ({
        id: item.avatar_cosmetic_items?.id || item.id,
        item_key: item.avatar_cosmetic_items?.item_key || item.item_key,
        item_name: item.avatar_cosmetic_items?.item_name || item.item_name,
        item_category: item.avatar_cosmetic_items?.item_category || item.item_category,
        item_data: item.avatar_cosmetic_items?.item_data || item.item_data,
        unlocked_at: item.unlocked_at
      }));

      // Calculate avatar stats
      const avatarStats = {
        avatar_level: avatarData.avatar_level || 1,
        total_xp: avatarData.total_xp || 0,
        unlocked_items_count: formattedUnlockedItems.length,
        active_title: avatarData.active_title_id ? {
          title_name: avatarData.active_title_name,
          title_color: avatarData.active_title_color,
          title_rarity: avatarData.active_title_rarity,
          title_icon: avatarData.active_title_icon
        } : undefined
      };

      return {
        avatar: {
          user_id: avatarData.user_id,
          first_name: avatarData.first_name,
          last_name: avatarData.last_name,
          avatar_url: avatarData.avatar_url,
          total_xp: avatarData.total_xp,
          current_level: avatarData.current_level,
          avatar_level: avatarData.avatar_level,
          active_title_id: avatarData.active_title_id,
          active_title_name: avatarData.active_title_name,
          active_title_color: avatarData.active_title_color,
          active_title_rarity: avatarData.active_title_rarity,
          active_title_icon: avatarData.active_title_icon
        },
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
      // Unlock default cosmetic items
      await AvatarService.unlockDefaultItems(userId);

      // Return a default avatar structure
      return {
        user_id: userId,
        first_name: '',
        last_name: '',
        avatar_url: '',
        total_xp: 0,
        current_level: 'Code Apprentice',
        avatar_level: 1,
        active_title_id: null,
        active_title_name: null,
        active_title_color: null,
        active_title_rarity: null,
        active_title_icon: null
      };

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
      // For now, return the current avatar data since we don't have a user_avatars table
      // This method would need to be updated when the avatar customization system is fully implemented
      const { data: avatarData, error: fetchError } = await supabase
        .from('user_avatar_complete')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch current avatar: ${fetchError.message}`);
      }

      if (!avatarData) {
        throw new Error('Avatar not found');
      }

      return {
        user_id: avatarData.user_id,
        first_name: avatarData.first_name,
        last_name: avatarData.last_name,
        avatar_url: avatarData.avatar_url,
        total_xp: avatarData.total_xp,
        current_level: avatarData.current_level,
        avatar_level: avatarData.avatar_level,
        active_title_id: avatarData.active_title_id,
        active_title_name: avatarData.active_title_name,
        active_title_color: avatarData.active_title_color,
        active_title_rarity: avatarData.active_title_rarity,
        active_title_icon: avatarData.active_title_icon
      };

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

      return (titles || []).map((title: any) => ({
        id: title.id,
        title_key: title.avatar_titles?.title_key || title.title_key,
        title_name: title.avatar_titles?.title_name || title.title_name,
        title_description: title.avatar_titles?.title_description || title.title_description,
        title_color: title.avatar_titles?.title_color || title.title_color,
        title_rarity: title.avatar_titles?.title_rarity || title.title_rarity,
        title_icon: title.avatar_titles?.title_icon || title.title_icon,
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
      // Update user XP in the user_xp table instead
      const { data: currentXP, error: fetchError } = await supabase
        .from('user_xp')
        .select('total_xp')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch user XP: ${fetchError.message}`);
      }

      const currentTotalXP = currentXP?.total_xp || 0;
      const newTotalXP = currentTotalXP + xpGained;
      const newAvatarLevel = AvatarService.calculateAvatarLevel(newTotalXP);

      // Update user XP
      const { error: updateError } = await supabase
        .from('user_xp')
        .upsert({
          user_id: userId,
          total_xp: newTotalXP,
          current_level: AvatarService.getLevelFromXP(newTotalXP)
        });

      if (updateError) {
        throw new Error(`Failed to update user XP: ${updateError.message}`);
      }

      // Check for new item unlocks if level increased
      if (newAvatarLevel > AvatarService.calculateAvatarLevel(currentTotalXP)) {
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
   * Helper: Get level name from XP
   */
  private static getLevelFromXP(xp: number): string {
    if (xp >= 5000) return 'Dev Sage';
    if (xp >= 4000) return 'Code Wizard';
    if (xp >= 3200) return 'Logic Architect';
    if (xp >= 2500) return 'Bug Hunter';
    return 'Code Apprentice';
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