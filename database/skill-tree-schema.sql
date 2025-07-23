-- =============================================
-- DevPath Chronicles - Phase 3: Skill Tree System
-- Advanced Engagement Features Database Schema
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SKILL TREE DEFINITIONS
-- =============================================

-- Define skill tree nodes (skills that can be learned)
CREATE TABLE skill_tree_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_key TEXT UNIQUE NOT NULL, -- e.g., 'php_basics', 'oracle_sql', 'advanced_php'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_category TEXT NOT NULL, -- 'php', 'oracle', 'general', 'database', 'web_development'
  node_level INTEGER NOT NULL DEFAULT 1, -- 1=beginner, 2=intermediate, 3=advanced, 4=expert, 5=master
  
  -- Tree positioning
  tree_path TEXT NOT NULL, -- e.g., 'php', 'oracle', 'general'
  position_x INTEGER NOT NULL, -- X coordinate in skill tree visualization
  position_y INTEGER NOT NULL, -- Y coordinate in skill tree visualization
  tier INTEGER NOT NULL DEFAULT 1, -- Tier/row in the skill tree (1-5)
  
  -- Requirements and rewards
  required_xp INTEGER NOT NULL DEFAULT 0,
  required_level INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  unlock_badge_id UUID, -- Optional badge awarded when skill is mastered
  
  -- Visual representation
  icon_name TEXT DEFAULT 'target', -- Lucide icon name
  icon_color TEXT DEFAULT 'blue', -- Color theme for the node
  node_type TEXT DEFAULT 'skill' CHECK (node_type IN ('skill', 'milestone', 'specialization', 'mastery')),
  
  -- Metadata
  is_core_skill BOOLEAN DEFAULT false, -- Core skills required for progression
  estimated_hours INTEGER DEFAULT 5, -- Estimated learning time
  difficulty_rating INTEGER DEFAULT 1 CHECK (difficulty_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Define prerequisites between skill nodes
CREATE TABLE skill_tree_prerequisites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_node_id UUID REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  prerequisite_node_id UUID REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true, -- true = hard requirement, false = recommended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(skill_node_id, prerequisite_node_id)
);

-- =============================================
-- USER SKILL PROGRESSION
-- =============================================

-- Track user progress through skill trees
CREATE TABLE user_skill_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_node_id UUID REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  
  -- Progress tracking
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed', 'mastered')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  xp_earned INTEGER DEFAULT 0,
  
  -- Engagement tracking
  time_spent_minutes INTEGER DEFAULT 0,
  quiz_attempts INTEGER DEFAULT 0,
  mentor_sessions INTEGER DEFAULT 0,
  learning_resources_accessed INTEGER DEFAULT 0,
  
  -- Completion tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  mastered_at TIMESTAMP WITH TIME ZONE, -- When user achieves mastery (100% + additional criteria)
  
  -- Learning path integration
  learning_plan_id UUID, -- References existing learning_plans table
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_node_id)
);

-- Track skill tree pathway choices (Oracle vs PHP specialization)
CREATE TABLE user_skill_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  path_name TEXT NOT NULL, -- 'oracle_specialist', 'php_developer', 'full_stack'
  is_primary BOOLEAN DEFAULT false, -- User's main career path
  chosen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0,
  
  -- Path completion rewards
  path_xp_bonus INTEGER DEFAULT 0,
  path_badge_earned UUID, -- Special badge for completing entire path
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path_name)
);

-- =============================================
-- SKILL TREE ACHIEVEMENTS AND MILESTONES
-- =============================================

-- Special achievements for skill tree progression
CREATE TABLE skill_tree_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('tier_completion', 'path_mastery', 'speed_learner', 'completionist', 'explorer')),
  
  -- Requirements
  required_skills_count INTEGER DEFAULT 1,
  required_tier INTEGER, -- Complete all skills in this tier
  required_path TEXT, -- Complete this entire path
  time_limit_hours INTEGER, -- For speed achievements
  
  -- Rewards
  xp_reward INTEGER DEFAULT 200,
  badge_id UUID, -- Badge awarded
  special_title TEXT, -- Special user title unlocked
  
  -- Visual
  icon_name TEXT DEFAULT 'award',
  icon_color TEXT DEFAULT 'gold',
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track user skill tree achievements
CREATE TABLE user_skill_tree_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES skill_tree_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_snapshot JSONB, -- Store progress details when achievement was earned
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- SEASONAL EVENTS SYSTEM
-- =============================================

-- Define seasonal events and special challenges
CREATE TABLE seasonal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('skill_focus', 'xp_boost', 'challenge_series', 'community_goal')),
  
  -- Event timing
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Event parameters
  xp_multiplier DECIMAL(3,2) DEFAULT 1.0, -- XP boost multiplier (e.g., 1.5 = 50% bonus)
  focus_skill_category TEXT, -- Bonus applies to specific skill category
  special_rewards JSONB, -- JSON array of special rewards/badges
  
  -- Community goals
  community_target INTEGER, -- Target for community-wide goals
  community_progress INTEGER DEFAULT 0,
  
  -- Visual theming
  theme_color TEXT DEFAULT 'purple',
  banner_image TEXT,
  icon_name TEXT DEFAULT 'star',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track user participation in seasonal events
CREATE TABLE user_seasonal_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES seasonal_events(id) ON DELETE CASCADE,
  
  -- Progress tracking
  participation_score INTEGER DEFAULT 0,
  xp_earned_during_event INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  special_rewards_earned JSONB DEFAULT '[]',
  
  -- Engagement
  first_participation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, event_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Skill tree node lookups
CREATE INDEX idx_skill_tree_nodes_category ON skill_tree_nodes(skill_category);
CREATE INDEX idx_skill_tree_nodes_level ON skill_tree_nodes(node_level);
CREATE INDEX idx_skill_tree_nodes_tier ON skill_tree_nodes(tier);
CREATE INDEX idx_skill_tree_nodes_path ON skill_tree_nodes(tree_path);

-- User progress lookups
CREATE INDEX idx_user_skill_progress_user ON user_skill_progress(user_id);
CREATE INDEX idx_user_skill_progress_status ON user_skill_progress(status);
CREATE INDEX idx_user_skill_progress_completed ON user_skill_progress(completed_at) WHERE completed_at IS NOT NULL;

-- Seasonal events
CREATE INDEX idx_seasonal_events_active ON seasonal_events(is_active, starts_at, ends_at);
CREATE INDEX idx_user_seasonal_progress_user ON user_seasonal_progress(user_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all user-specific tables
ALTER TABLE user_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_tree_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_seasonal_progress ENABLE ROW LEVEL SECURITY;

-- User can only access their own progress
CREATE POLICY "Users can manage their skill progress" ON user_skill_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their skill paths" ON user_skill_paths
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their skill achievements" ON user_skill_tree_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their seasonal progress" ON user_seasonal_progress
  FOR ALL USING (auth.uid() = user_id);

-- Public read access to definitions (skill trees, achievements, events)
CREATE POLICY "Anyone can view skill tree nodes" ON skill_tree_nodes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view skill prerequisites" ON skill_tree_prerequisites
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view skill tree achievements" ON skill_tree_achievements
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active seasonal events" ON seasonal_events
  FOR SELECT USING (is_active = true);

-- =============================================
-- SAMPLE DATA: PHP DEVELOPER SKILL TREE
-- =============================================

-- Insert PHP skill tree nodes
INSERT INTO skill_tree_nodes (node_key, title, description, skill_category, node_level, tree_path, position_x, position_y, tier, required_xp, required_level, xp_reward, icon_name, icon_color, node_type, is_core_skill, estimated_hours, difficulty_rating) VALUES

-- Tier 1: Foundations
('php_basics', 'PHP Fundamentals', 'Learn PHP syntax, variables, and basic programming concepts', 'php', 1, 'php', 100, 50, 1, 0, 1, 100, 'code', 'green', 'skill', true, 8, 1),
('html_css_basics', 'HTML & CSS Basics', 'Foundation of web development with HTML and CSS', 'web_development', 1, 'php', 200, 50, 1, 0, 1, 75, 'layout', 'blue', 'skill', true, 6, 1),
('programming_logic', 'Programming Logic', 'Understand algorithms, loops, and conditional statements', 'general', 1, 'php', 50, 50, 1, 0, 1, 100, 'cpu', 'purple', 'skill', true, 10, 2),

-- Tier 2: Intermediate Skills  
('php_oop', 'Object-Oriented PHP', 'Classes, objects, inheritance, and polymorphism in PHP', 'php', 2, 'php', 100, 150, 2, 200, 2, 150, 'package', 'green', 'skill', true, 12, 3),
('mysql_basics', 'MySQL Fundamentals', 'Database design, SQL queries, and PHP-MySQL integration', 'database', 2, 'php', 200, 150, 2, 150, 2, 125, 'database', 'orange', 'skill', true, 10, 2),
('web_security', 'Web Security Basics', 'Input validation, SQL injection prevention, and secure coding', 'php', 2, 'php', 300, 150, 2, 250, 3, 175, 'shield', 'red', 'skill', false, 8, 3),

-- Tier 3: Advanced Development
('php_frameworks', 'PHP Frameworks', 'Master Laravel, Symfony, or CodeIgniter framework', 'php', 3, 'php', 100, 250, 3, 500, 4, 200, 'layers', 'green', 'specialization', true, 20, 4),
('api_development', 'REST API Development', 'Build and consume RESTful web services', 'php', 3, 'php', 200, 250, 3, 450, 4, 200, 'globe', 'blue', 'skill', false, 15, 4),
('advanced_mysql', 'Advanced Database Design', 'Complex queries, optimization, and database architecture', 'database', 3, 'php', 300, 250, 3, 400, 4, 175, 'server', 'orange', 'skill', false, 18, 4),

-- Tier 4: Expert Level
('full_stack_php', 'Full-Stack PHP Mastery', 'Complete web application development with modern tools', 'php', 4, 'php', 150, 350, 4, 1000, 6, 300, 'crown', 'gold', 'mastery', true, 30, 5),
('php_performance', 'Performance Optimization', 'Code optimization, caching, and scalability techniques', 'php', 4, 'php', 250, 350, 4, 800, 5, 250, 'zap', 'yellow', 'skill', false, 25, 5);

-- Insert skill prerequisites
INSERT INTO skill_tree_prerequisites (skill_node_id, prerequisite_node_id, is_required) VALUES
-- PHP OOP requires PHP basics
((SELECT id FROM skill_tree_nodes WHERE node_key = 'php_oop'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'php_basics'), true),
-- Frameworks require OOP
((SELECT id FROM skill_tree_nodes WHERE node_key = 'php_frameworks'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'php_oop'), true),
-- API development requires frameworks and MySQL
((SELECT id FROM skill_tree_nodes WHERE node_key = 'api_development'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'php_frameworks'), true),
((SELECT id FROM skill_tree_nodes WHERE node_key = 'api_development'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'mysql_basics'), true),
-- Full-stack mastery requires multiple prerequisites
((SELECT id FROM skill_tree_nodes WHERE node_key = 'full_stack_php'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'php_frameworks'), true),
((SELECT id FROM skill_tree_nodes WHERE node_key = 'full_stack_php'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'api_development'), true),
((SELECT id FROM skill_tree_nodes WHERE node_key = 'full_stack_php'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'web_security'), true);

-- =============================================
-- SAMPLE DATA: ORACLE SPECIALIST SKILL TREE
-- =============================================

-- Insert Oracle skill tree nodes
INSERT INTO skill_tree_nodes (node_key, title, description, skill_category, node_level, tree_path, position_x, position_y, tier, required_xp, required_level, xp_reward, icon_name, icon_color, node_type, is_core_skill, estimated_hours, difficulty_rating) VALUES

-- Tier 1: Oracle Foundations
('sql_basics', 'SQL Fundamentals', 'Basic SELECT, INSERT, UPDATE, DELETE operations', 'oracle', 1, 'oracle', 100, 50, 1, 0, 1, 100, 'database', 'blue', 'skill', true, 8, 1),
('oracle_architecture', 'Oracle Architecture', 'Understanding Oracle database structure and instances', 'oracle', 1, 'oracle', 200, 50, 1, 0, 1, 125, 'server', 'orange', 'skill', true, 10, 2),
('data_modeling', 'Data Modeling', 'Entity relationships, normalization, and database design', 'database', 1, 'oracle', 50, 50, 1, 0, 1, 100, 'git-branch', 'purple', 'skill', true, 12, 3),

-- Tier 2: Intermediate Oracle
('advanced_sql', 'Advanced SQL', 'Complex joins, subqueries, analytical functions', 'oracle', 2, 'oracle', 100, 150, 2, 200, 2, 150, 'search', 'blue', 'skill', true, 15, 3),
('plsql_basics', 'PL/SQL Programming', 'Stored procedures, functions, and Oracle programming', 'oracle', 2, 'oracle', 200, 150, 2, 250, 3, 175, 'code2', 'green', 'skill', true, 18, 4),
('oracle_administration', 'Database Administration', 'User management, backups, and database maintenance', 'oracle', 2, 'oracle', 300, 150, 2, 300, 3, 150, 'settings', 'gray', 'skill', false, 20, 4),

-- Tier 3: Oracle Specialization
('performance_tuning', 'Performance Tuning', 'Query optimization, indexing strategies, and performance analysis', 'oracle', 3, 'oracle', 100, 250, 3, 600, 5, 225, 'trending-up', 'red', 'specialization', true, 25, 5),
('oracle_security', 'Oracle Security', 'Data encryption, access control, and security best practices', 'oracle', 3, 'oracle', 200, 250, 3, 500, 4, 200, 'lock', 'red', 'skill', false, 20, 4),
('data_warehousing', 'Data Warehousing', 'ETL processes, OLAP, and business intelligence with Oracle', 'oracle', 3, 'oracle', 300, 250, 3, 700, 5, 250, 'archive', 'indigo', 'skill', false, 30, 5),

-- Tier 4: Oracle Mastery
('oracle_expert', 'Oracle Database Expert', 'Master-level Oracle administration and development', 'oracle', 4, 'oracle', 200, 350, 4, 1200, 7, 350, 'crown', 'gold', 'mastery', true, 40, 5);

-- Insert Oracle skill prerequisites
INSERT INTO skill_tree_prerequisites (skill_node_id, prerequisite_node_id, is_required) VALUES
-- Advanced SQL requires SQL basics
((SELECT id FROM skill_tree_nodes WHERE node_key = 'advanced_sql'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'sql_basics'), true),
-- PL/SQL requires advanced SQL
((SELECT id FROM skill_tree_nodes WHERE node_key = 'plsql_basics'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'advanced_sql'), true),
-- Performance tuning requires PL/SQL and architecture knowledge
((SELECT id FROM skill_tree_nodes WHERE node_key = 'performance_tuning'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'plsql_basics'), true),
((SELECT id FROM skill_tree_nodes WHERE node_key = 'performance_tuning'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'oracle_architecture'), true),
-- Oracle expert requires multiple specializations
((SELECT id FROM skill_tree_nodes WHERE node_key = 'oracle_expert'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'performance_tuning'), true),
((SELECT id FROM skill_tree_nodes WHERE node_key = 'oracle_expert'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'oracle_security'), false), -- Recommended but not required
((SELECT id FROM skill_tree_nodes WHERE node_key = 'oracle_expert'), (SELECT id FROM skill_tree_nodes WHERE node_key = 'oracle_administration'), true);

-- =============================================
-- SAMPLE SEASONAL EVENTS
-- =============================================

-- Insert sample seasonal events
INSERT INTO seasonal_events (event_key, title, description, event_type, starts_at, ends_at, xp_multiplier, focus_skill_category, theme_color, icon_name) VALUES
('spring_coding_sprint', 'Spring Coding Sprint', 'Double XP for all PHP-related learning activities during spring!', 'xp_boost', '2025-03-01 00:00:00+00', '2025-03-31 23:59:59+00', 2.0, 'php', 'green', 'leaf'),
('oracle_mastery_month', 'Oracle Mastery Month', 'Special challenges and bonuses for Oracle database learning', 'skill_focus', '2025-04-01 00:00:00+00', '2025-04-30 23:59:59+00', 1.5, 'oracle', 'blue', 'database'),
('summer_challenge_series', 'Summer Learning Challenge', 'Complete daily challenges to earn exclusive summer badges', 'challenge_series', '2025-06-01 00:00:00+00', '2025-08-31 23:59:59+00', 1.2, null, 'yellow', 'sun');

-- =============================================
-- SAMPLE SKILL TREE ACHIEVEMENTS
-- =============================================

-- Insert skill tree achievements
INSERT INTO skill_tree_achievements (achievement_key, title, description, achievement_type, required_skills_count, required_tier, xp_reward, icon_name, icon_color, rarity) VALUES
('tier_1_complete', 'Foundation Builder', 'Complete all Tier 1 foundational skills', 'tier_completion', 3, 1, 300, 'award', 'bronze', 'common'),
('tier_2_complete', 'Skill Developer', 'Complete all Tier 2 intermediate skills', 'tier_completion', 3, 2, 500, 'award', 'silver', 'rare'),
('tier_3_complete', 'Advanced Practitioner', 'Complete all Tier 3 advanced skills', 'tier_completion', 3, 3, 750, 'award', 'gold', 'epic'),
('php_path_master', 'PHP Path Master', 'Complete the entire PHP developer learning path', 'path_mastery', 5, null, 1000, 'crown', 'purple', 'legendary'),
('oracle_path_master', 'Oracle Path Master', 'Complete the entire Oracle specialist learning path', 'path_mastery', 6, null, 1200, 'crown', 'blue', 'legendary'),
('speed_learner', 'Speed Learner', 'Complete any skill in under 4 hours', 'speed_learner', 1, null, 250, 'zap', 'yellow', 'rare'),
('skill_explorer', 'Skill Explorer', 'Start learning in both PHP and Oracle paths', 'explorer', 2, null, 200, 'compass', 'green', 'common');

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update user_skill_progress.updated_at on changes
CREATE OR REPLACE FUNCTION update_skill_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_skill_progress_timestamp
  BEFORE UPDATE ON user_skill_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_progress_timestamp();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for user skill tree overview
CREATE OR REPLACE VIEW user_skill_tree_overview AS
SELECT 
  u.id as user_id,
  stn.tree_path,
  COUNT(*) as total_skills,
  COUNT(CASE WHEN usp.status = 'completed' THEN 1 END) as completed_skills,
  COUNT(CASE WHEN usp.status = 'mastered' THEN 1 END) as mastered_skills,
  COALESCE(SUM(usp.xp_earned), 0) as total_xp_from_skills,
  ROUND(
    (COUNT(CASE WHEN usp.status IN ('completed', 'mastered') THEN 1 END) * 100.0) / COUNT(*), 
    2
  ) as completion_percentage
FROM auth.users u
CROSS JOIN (SELECT DISTINCT tree_path FROM skill_tree_nodes) paths
LEFT JOIN skill_tree_nodes stn ON stn.tree_path = paths.tree_path
LEFT JOIN user_skill_progress usp ON usp.user_id = u.id AND usp.skill_node_id = stn.id
GROUP BY u.id, stn.tree_path;

-- View for skill node with prerequisites
CREATE OR REPLACE VIEW skill_nodes_with_prerequisites AS
SELECT 
  stn.*,
  array_agg(
    json_build_object(
      'id', prereq.id,
      'title', prereq.title,
      'node_key', prereq.node_key,
      'is_required', stp.is_required
    )
  ) FILTER (WHERE prereq.id IS NOT NULL) as prerequisites
FROM skill_tree_nodes stn
LEFT JOIN skill_tree_prerequisites stp ON stp.skill_node_id = stn.id
LEFT JOIN skill_tree_nodes prereq ON prereq.id = stp.prerequisite_node_id
GROUP BY stn.id;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE skill_tree_nodes IS 'Defines all available skills in the learning tree with positioning and requirements';
COMMENT ON TABLE skill_tree_prerequisites IS 'Defines prerequisite relationships between skills';
COMMENT ON TABLE user_skill_progress IS 'Tracks individual user progress through the skill tree';
COMMENT ON TABLE user_skill_paths IS 'Tracks which career paths users have chosen (PHP, Oracle, etc.)';
COMMENT ON TABLE seasonal_events IS 'Defines time-limited events with special rewards and bonuses';
COMMENT ON TABLE user_seasonal_progress IS 'Tracks user participation in seasonal events';

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'DevPath Chronicles Phase 3 Schema Installation Complete!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- Interactive Skill Tree System';
  RAISE NOTICE '- User Progress Tracking';
  RAISE NOTICE '- Seasonal Events Framework';  
  RAISE NOTICE '- Skill Tree Achievements';
  RAISE NOTICE '- Sample PHP & Oracle Learning Paths';
  RAISE NOTICE '- Performance Optimized Indexes';
  RAISE NOTICE '- Row Level Security Policies';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Ready for Phase 3 UI Components!';
  RAISE NOTICE '====================================';
END $$;