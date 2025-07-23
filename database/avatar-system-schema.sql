-- =============================================
-- DevPath Chronicles - Phase 3: Avatar System Extension
-- Personalized Avatar/Character System
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- AVATAR COSMETIC ITEMS SYSTEM
-- =============================================

-- Define available cosmetic items that can be unlocked
CREATE TABLE avatar_cosmetic_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_key TEXT UNIQUE NOT NULL, -- e.g., 'wizard_hat', 'casual_shirt', 'study_glasses'
  item_name TEXT NOT NULL,
  item_description TEXT NOT NULL,
  item_category TEXT NOT NULL CHECK (item_category IN ('hair_style', 'hair_color', 'clothing_style', 'clothing_color', 'accessories', 'background_theme')),
  
  -- Unlock requirements
  required_level INTEGER DEFAULT 1,
  required_xp INTEGER DEFAULT 0,
  required_achievement_id UUID, -- Must earn specific achievement
  required_skill_completion TEXT, -- Must complete specific skill
  unlock_cost INTEGER DEFAULT 0, -- Cost in XP or special currency
  
  -- Item properties
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_default BOOLEAN DEFAULT false, -- Available to all users by default
  is_premium BOOLEAN DEFAULT false, -- Requires special unlock
  season_exclusive TEXT, -- Only available during specific seasons
  
  -- Visual data
  item_data JSONB NOT NULL, -- Color codes, style properties, etc.
  preview_image TEXT, -- URL to preview image
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track user's unlocked cosmetic items
CREATE TABLE user_avatar_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES avatar_cosmetic_items(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_method TEXT DEFAULT 'achievement', -- 'achievement', 'level', 'purchase', 'seasonal'
  UNIQUE(user_id, item_id)
);

-- Avatar presets/templates for quick customization
CREATE TABLE avatar_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  preset_key TEXT UNIQUE NOT NULL,
  preset_name TEXT NOT NULL,
  preset_description TEXT NOT NULL,
  avatar_type TEXT NOT NULL CHECK (avatar_type IN ('developer', 'architect', 'specialist', 'mentor')),
  
  -- Default customization for this preset
  default_customization JSONB NOT NULL,
  
  -- Requirements to unlock preset
  required_level INTEGER DEFAULT 1,
  required_skills TEXT[], -- Array of skill node keys
  
  -- Metadata
  is_starter_preset BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AVATAR PROGRESSION AND TITLES
-- =============================================

-- Special titles that can be earned and displayed
CREATE TABLE avatar_titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_key TEXT UNIQUE NOT NULL,
  title_name TEXT NOT NULL,
  title_description TEXT NOT NULL,
  title_type TEXT DEFAULT 'achievement' CHECK (title_type IN ('achievement', 'skill', 'seasonal', 'social', 'special')),
  
  -- Unlock requirements
  required_achievement_id UUID,
  required_skill_path TEXT, -- Complete entire skill path
  required_guild_rank INTEGER, -- Achieve guild rank
  required_seasonal_event TEXT, -- Participate in seasonal event
  custom_requirement TEXT, -- Custom unlock logic
  
  -- Visual properties
  title_color TEXT DEFAULT 'blue',
  title_rarity TEXT DEFAULT 'common' CHECK (title_rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  title_icon TEXT DEFAULT 'award',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  display_priority INTEGER DEFAULT 0, -- Higher priority titles show first
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track user's earned titles
CREATE TABLE user_avatar_titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id UUID REFERENCES avatar_titles(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false, -- Only one title can be active at a time
  UNIQUE(user_id, title_id)
);

-- Avatar interaction history (for social features)
CREATE TABLE avatar_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('compliment', 'high_five', 'study_buddy', 'mentor_request')),
  interaction_message TEXT,
  avatar_context JSONB, -- Store avatar appearance at time of interaction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Avatar items lookups
CREATE INDEX idx_avatar_cosmetic_items_category ON avatar_cosmetic_items(item_category);
CREATE INDEX idx_avatar_cosmetic_items_rarity ON avatar_cosmetic_items(rarity);
CREATE INDEX idx_user_avatar_items_user ON user_avatar_items(user_id);

-- Avatar titles
CREATE INDEX idx_avatar_titles_type ON avatar_titles(title_type);
CREATE INDEX idx_user_avatar_titles_user ON user_avatar_titles(user_id);
CREATE INDEX idx_user_avatar_titles_active ON user_avatar_titles(user_id, is_active) WHERE is_active = true;

-- Avatar interactions
CREATE INDEX idx_avatar_interactions_from ON avatar_interactions(from_user_id);
CREATE INDEX idx_avatar_interactions_to ON avatar_interactions(to_user_id);
CREATE INDEX idx_avatar_interactions_created ON avatar_interactions(created_at);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on user-specific tables
ALTER TABLE user_avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatar_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_interactions ENABLE ROW LEVEL SECURITY;

-- User can only access their own avatar items and titles
CREATE POLICY "Users can manage their avatar items" ON user_avatar_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their avatar titles" ON user_avatar_titles
  FOR ALL USING (auth.uid() = user_id);

-- Avatar interactions - users can see interactions they're involved in
CREATE POLICY "Users can view their avatar interactions" ON avatar_interactions
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create avatar interactions" ON avatar_interactions
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Public read access to cosmetic definitions
CREATE POLICY "Anyone can view cosmetic items" ON avatar_cosmetic_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view avatar presets" ON avatar_presets
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view avatar titles" ON avatar_titles
  FOR SELECT USING (is_active = true);

-- =============================================
-- SAMPLE DATA: DEFAULT COSMETIC ITEMS
-- =============================================

-- Hair Styles
INSERT INTO avatar_cosmetic_items (item_key, item_name, item_description, item_category, rarity, is_default, item_data) VALUES
('short_hair', 'Short Hair', 'Classic short hairstyle', 'hair_style', 'common', true, '{"style": "short", "texture": "smooth"}'),
('long_hair', 'Long Hair', 'Flowing long hair', 'hair_style', 'common', true, '{"style": "long", "texture": "wavy"}'),
('curly_hair', 'Curly Hair', 'Natural curly hairstyle', 'hair_style', 'uncommon', false, '{"style": "curly", "texture": "curly"}'),
('spiky_hair', 'Spiky Hair', 'Edgy spiky hairstyle', 'hair_style', 'uncommon', false, '{"style": "spiky", "texture": "gel"}'),
('wizard_hair', 'Wizard Hair', 'Mystical flowing wizard hair', 'hair_style', 'epic', false, '{"style": "wizard", "texture": "magical", "effects": ["sparkle"]}');

-- Hair Colors
INSERT INTO avatar_cosmetic_items (item_key, item_name, item_description, item_category, rarity, is_default, item_data) VALUES
('black_hair', 'Black Hair', 'Classic black hair color', 'hair_color', 'common', true, '{"color": "#2c1810", "name": "black"}'),
('brown_hair', 'Brown Hair', 'Natural brown hair color', 'hair_color', 'common', true, '{"color": "#8b4513", "name": "brown"}'),
('blonde_hair', 'Blonde Hair', 'Golden blonde hair color', 'hair_color', 'common', true, '{"color": "#f4d03f", "name": "blonde"}'),
('red_hair', 'Red Hair', 'Vibrant red hair color', 'hair_color', 'uncommon', false, '{"color": "#c0392b", "name": "red"}'),
('purple_hair', 'Purple Hair', 'Bold purple hair color', 'hair_color', 'rare', false, '{"color": "#9b59b6", "name": "purple"}'),
('rainbow_hair', 'Rainbow Hair', 'Magical rainbow hair color', 'hair_color', 'legendary', false, '{"color": "rainbow", "name": "rainbow", "effects": ["shimmer"]}');

-- Clothing Styles
INSERT INTO avatar_cosmetic_items (item_key, item_name, item_description, item_category, rarity, is_default, item_data) VALUES
('casual_shirt', 'Casual Shirt', 'Comfortable casual shirt', 'clothing_style', 'common', true, '{"type": "shirt", "style": "casual", "formality": "casual"}'),
('business_shirt', 'Business Shirt', 'Professional business attire', 'clothing_style', 'common', true, '{"type": "shirt", "style": "business", "formality": "formal"}'),
('hoodie', 'Developer Hoodie', 'Cozy developer hoodie', 'clothing_style', 'uncommon', false, '{"type": "hoodie", "style": "developer", "formality": "casual"}'),
('lab_coat', 'Lab Coat', 'Scientific research lab coat', 'clothing_style', 'rare', false, '{"type": "coat", "style": "lab", "formality": "professional"}'),
('wizard_robe', 'Wizard Robe', 'Mystical coding wizard robe', 'clothing_style', 'epic', false, '{"type": "robe", "style": "wizard", "formality": "magical", "effects": ["glow"]}');

-- Accessories
INSERT INTO avatar_cosmetic_items (item_key, item_name, item_description, item_category, rarity, is_default, item_data) VALUES
('glasses', 'Glasses', 'Smart developer glasses', 'accessories', 'common', true, '{"type": "glasses", "style": "rectangular", "color": "black"}'),
('sunglasses', 'Sunglasses', 'Cool sunglasses', 'accessories', 'uncommon', false, '{"type": "sunglasses", "style": "aviator", "color": "black"}'),
('headphones', 'Headphones', 'Music headphones', 'accessories', 'uncommon', false, '{"type": "headphones", "style": "over-ear", "color": "black"}'),
('wizard_hat', 'Wizard Hat', 'Magical coding wizard hat', 'accessories', 'epic', false, '{"type": "hat", "style": "wizard", "color": "purple", "effects": ["stars"]}'),
('crown', 'Achievement Crown', 'Crown of mastery', 'accessories', 'legendary', false, '{"type": "crown", "style": "royal", "color": "gold", "effects": ["sparkle"]}');

-- Background Themes
INSERT INTO avatar_cosmetic_items (item_key, item_name, item_description, item_category, rarity, is_default, item_data) VALUES
('office_bg', 'Office Background', 'Professional office setting', 'background_theme', 'common', true, '{"theme": "office", "colors": ["#f8f9fa", "#e9ecef"], "mood": "professional"}'),
('home_bg', 'Home Office Background', 'Cozy home office setup', 'background_theme', 'common', true, '{"theme": "home", "colors": ["#fff3cd", "#ffeaa7"], "mood": "cozy"}'),
('cafe_bg', 'Cafe Background', 'Trendy coffee shop atmosphere', 'background_theme', 'uncommon', false, '{"theme": "cafe", "colors": ["#d4a574", "#8b4513"], "mood": "creative"}'),
('nature_bg', 'Nature Background', 'Peaceful outdoor setting', 'background_theme', 'rare', false, '{"theme": "nature", "colors": ["#2ecc71", "#27ae60"], "mood": "peaceful"}'),
('space_bg', 'Space Background', 'Cosmic coding environment', 'background_theme', 'epic', false, '{"theme": "space", "colors": ["#2c3e50", "#8e44ad"], "mood": "cosmic", "effects": ["stars"]}');

-- =============================================
-- SAMPLE DATA: AVATAR PRESETS
-- =============================================

INSERT INTO avatar_presets (preset_key, preset_name, preset_description, avatar_type, default_customization, is_starter_preset, display_order) VALUES
('beginner_dev', 'Beginner Developer', 'Perfect for starting your coding journey', 'developer', 
'{"avatar_type": "developer", "skin_tone": "medium", "hair_style": "short_hair", "hair_color": "brown_hair", "clothing_style": "casual_shirt", "clothing_color": "blue", "accessories": ["glasses"], "background_theme": "home_bg"}', 
true, 1),

('pro_coder', 'Professional Coder', 'For the serious developer', 'developer',
'{"avatar_type": "developer", "skin_tone": "light", "hair_style": "short_hair", "hair_color": "black_hair", "clothing_style": "business_shirt", "clothing_color": "white", "accessories": ["glasses"], "background_theme": "office_bg"}',
false, 2),

('creative_dev', 'Creative Developer', 'Express your creative side', 'developer',
'{"avatar_type": "developer", "skin_tone": "medium", "hair_style": "curly_hair", "hair_color": "purple_hair", "clothing_style": "hoodie", "clothing_color": "purple", "accessories": ["headphones"], "background_theme": "cafe_bg"}',
false, 3),

('data_architect', 'Data Architect', 'For database specialists', 'architect',
'{"avatar_type": "architect", "skin_tone": "dark", "hair_style": "long_hair", "hair_color": "black_hair", "clothing_style": "business_shirt", "clothing_color": "navy", "accessories": ["glasses"], "background_theme": "office_bg"}',
false, 4),

('coding_wizard', 'Coding Wizard', 'Mystical master of code', 'specialist',
'{"avatar_type": "specialist", "skin_tone": "light", "hair_style": "wizard_hair", "hair_color": "rainbow_hair", "clothing_style": "wizard_robe", "clothing_color": "purple", "accessories": ["wizard_hat"], "background_theme": "space_bg"}',
false, 5);

-- =============================================
-- SAMPLE DATA: AVATAR TITLES
-- =============================================

INSERT INTO avatar_titles (title_key, title_name, title_description, title_type, title_color, title_rarity, title_icon) VALUES
('code_apprentice', 'Code Apprentice', 'Just starting the coding journey', 'achievement', 'gray', 'common', 'user'),
('bug_hunter', 'Bug Hunter', 'Skilled at finding and fixing bugs', 'achievement', 'orange', 'uncommon', 'bug'),
('logic_architect', 'Logic Architect', 'Builds solid code foundations', 'achievement', 'blue', 'rare', 'cpu'),
('code_wizard', 'Code Wizard', 'Masters the mystical arts of programming', 'achievement', 'purple', 'epic', 'zap'),
('dev_sage', 'Dev Sage', 'Ultimate wisdom in software development', 'achievement', 'gold', 'legendary', 'crown'),

('php_master', 'PHP Master', 'Completed the PHP developer path', 'skill', 'purple', 'epic', 'code'),
('oracle_expert', 'Oracle Expert', 'Mastered Oracle database systems', 'skill', 'blue', 'epic', 'database'),
('full_stack_hero', 'Full-Stack Hero', 'Conquered both frontend and backend', 'skill', 'green', 'legendary', 'layers'),

('guild_leader', 'Guild Leader', 'Leadership role in a developer guild', 'social', 'red', 'rare', 'users'),
('mentor', 'Mentor', 'Helps guide other developers', 'social', 'teal', 'rare', 'heart'),
('community_champion', 'Community Champion', 'Active in community events', 'social', 'pink', 'uncommon', 'star'),

('event_champion', 'Event Champion', 'Excelled in seasonal events', 'seasonal', 'rainbow', 'epic', 'trophy'),
('speed_learner', 'Speed Learner', 'Completed skills in record time', 'special', 'yellow', 'rare', 'zap'),
('perfectionist', 'Perfectionist', 'Achieved perfect scores consistently', 'special', 'platinum', 'epic', 'target');

-- =============================================
-- FUNCTIONS FOR AVATAR SYSTEM
-- =============================================

-- Function to unlock cosmetic items based on user progress
CREATE OR REPLACE FUNCTION unlock_cosmetic_items_for_user(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  item_record RECORD;
  user_level INTEGER;
  user_xp INTEGER;
  items_unlocked INTEGER := 0;
BEGIN
  -- Get user's current level and XP
  SELECT 
    CASE 
      WHEN current_level = 'Code Apprentice' THEN 1
      WHEN current_level = 'Bug Hunter' THEN 2
      WHEN current_level = 'Logic Architect' THEN 3
      WHEN current_level = 'Code Wizard' THEN 4
      WHEN current_level = 'Dev Sage' THEN 5
      ELSE 1
    END,
    total_xp
  INTO user_level, user_xp
  FROM user_xp 
  WHERE user_id = p_user_id;

  -- Default values if no XP record exists
  user_level := COALESCE(user_level, 1);
  user_xp := COALESCE(user_xp, 0);

  -- Check each cosmetic item for unlock eligibility
  FOR item_record IN 
    SELECT * FROM avatar_cosmetic_items 
    WHERE is_active = true 
    AND id NOT IN (
      SELECT item_id FROM user_avatar_items WHERE user_id = p_user_id
    )
  LOOP
    -- Check if user meets requirements
    IF (item_record.required_level <= user_level AND item_record.required_xp <= user_xp) THEN
      -- Unlock the item
      INSERT INTO user_avatar_items (user_id, item_id, unlock_method)
      VALUES (p_user_id, item_record.id, 'level');
      
      items_unlocked := items_unlocked + 1;
    END IF;
  END LOOP;

  RETURN items_unlocked;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate avatar level based on total XP
CREATE OR REPLACE FUNCTION calculate_avatar_level(p_total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Avatar levels based on XP thresholds
  IF p_total_xp >= 5000 THEN RETURN 10;
  ELSIF p_total_xp >= 4000 THEN RETURN 9;
  ELSIF p_total_xp >= 3200 THEN RETURN 8;
  ELSIF p_total_xp >= 2500 THEN RETURN 7;
  ELSIF p_total_xp >= 1900 THEN RETURN 6;
  ELSIF p_total_xp >= 1400 THEN RETURN 5;
  ELSIF p_total_xp >= 1000 THEN RETURN 4;
  ELSIF p_total_xp >= 700 THEN RETURN 3;
  ELSIF p_total_xp >= 400 THEN RETURN 2;
  ELSE RETURN 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update user_avatars.updated_at on changes
CREATE OR REPLACE FUNCTION update_avatar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_avatar_timestamp
  BEFORE UPDATE ON user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_avatar_timestamp();

-- Trigger to automatically unlock items when user gains XP
CREATE OR REPLACE FUNCTION auto_unlock_avatar_items()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run on XP increases
  IF NEW.total_xp > OLD.total_xp THEN
    PERFORM unlock_cosmetic_items_for_user(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_unlock_avatar_items
  AFTER UPDATE ON user_xp
  FOR EACH ROW
  EXECUTE FUNCTION auto_unlock_avatar_items();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for user avatar with all customization options
CREATE OR REPLACE VIEW user_avatar_complete AS
SELECT 
  ua.*,
  -- Calculate avatar level from total XP
  calculate_avatar_level(COALESCE(ux.total_xp, 0)) as calculated_avatar_level,
  ux.total_xp,
  
  -- Get active title
  (
    SELECT jsonb_build_object(
      'title_name', at.title_name,
      'title_color', at.title_color,
      'title_rarity', at.title_rarity,
      'title_icon', at.title_icon
    )
    FROM user_avatar_titles uat
    JOIN avatar_titles at ON at.id = uat.title_id
    WHERE uat.user_id = ua.user_id AND uat.is_active = true
    LIMIT 1
  ) as active_title,
  
  -- Count unlocked items
  (
    SELECT COUNT(*)
    FROM user_avatar_items uai
    WHERE uai.user_id = ua.user_id
  ) as unlocked_items_count

FROM user_avatars ua
LEFT JOIN user_xp ux ON ux.user_id = ua.user_id;

-- View for available cosmetic items with unlock status
CREATE OR REPLACE VIEW user_cosmetic_items_status AS
SELECT 
  aci.*,
  CASE 
    WHEN uai.id IS NOT NULL THEN true 
    ELSE false 
  END as is_unlocked,
  uai.unlocked_at,
  uai.unlock_method,
  -- Check if user meets requirements to unlock
  CASE 
    WHEN uai.id IS NOT NULL THEN true
    WHEN aci.is_default THEN true
    WHEN calculate_avatar_level(COALESCE(ux.total_xp, 0)) >= aci.required_level 
         AND COALESCE(ux.total_xp, 0) >= aci.required_xp THEN true
    ELSE false
  END as can_unlock
FROM avatar_cosmetic_items aci
CROSS JOIN auth.users u
LEFT JOIN user_avatar_items uai ON uai.item_id = aci.id AND uai.user_id = u.id
LEFT JOIN user_xp ux ON ux.user_id = u.id
WHERE aci.is_active = true;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Avatar System Schema Installation Complete!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- Cosmetic Items System (Hair, Clothing, Accessories)';
  RAISE NOTICE '- Avatar Presets & Templates';
  RAISE NOTICE '- Avatar Titles & Achievements';
  RAISE NOTICE '- Avatar Social Interactions';
  RAISE NOTICE '- Automatic Item Unlocking';
  RAISE NOTICE '- Sample Cosmetic Items & Presets';
  RAISE NOTICE '- RLS Security Policies';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Ready for Avatar UI Components!';
  RAISE NOTICE '====================================';
END $$;