-- =============================================
-- DevPath Chronicles - Phase 3: Quest Narrative System
-- Story-Driven Learning Framework
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- QUEST NARRATIVE CONTENT
-- =============================================

-- Quest givers/NPCs that provide quests and dialogue
CREATE TABLE quest_npcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  npc_key TEXT UNIQUE NOT NULL, -- e.g., 'sage_mentor', 'guild_master', 'code_oracle'
  npc_name TEXT NOT NULL,
  npc_title TEXT NOT NULL, -- "The Code Sage", "Master of Databases"
  npc_description TEXT NOT NULL,
  npc_personality TEXT NOT NULL, -- 'wise', 'encouraging', 'challenging', 'mysterious'
  
  -- Visual representation
  npc_avatar_emoji TEXT DEFAULT '🧙‍♂️',
  npc_avatar_color TEXT DEFAULT 'purple',
  npc_background_theme TEXT DEFAULT 'mystical',
  
  -- NPC specialization and quest types they provide
  specializes_in TEXT[], -- ['php', 'oracle', 'general', 'leadership']
  quest_types TEXT[], -- ['main_story', 'skill_mastery', 'daily_quest']
  
  -- NPC availability
  appears_at_level INTEGER DEFAULT 1,
  requires_skill_completion TEXT[], -- Skills that must be completed to meet this NPC
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest storylines/campaigns that group related quests
CREATE TABLE quest_storylines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyline_key TEXT UNIQUE NOT NULL, -- e.g., 'php_masters_path', 'oracle_trials'
  storyline_name TEXT NOT NULL,
  storyline_description TEXT NOT NULL,
  storyline_summary TEXT NOT NULL, -- Brief overview of the storyline
  
  -- Storyline progression
  skill_focus TEXT NOT NULL, -- 'php', 'oracle', 'general', 'full_stack'
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration_hours INTEGER DEFAULT 20,
  
  -- Requirements and rewards
  required_level INTEGER DEFAULT 1,
  prerequisite_storylines TEXT[], -- Other storylines that should be completed first
  
  -- Storyline rewards
  completion_xp_bonus INTEGER DEFAULT 500,
  completion_badge_id UUID,
  completion_title TEXT, -- Special title awarded for completing storyline
  
  -- Visual theming
  storyline_theme TEXT DEFAULT 'adventure',
  storyline_color TEXT DEFAULT 'blue',
  banner_image TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual quest steps/chapters within quests
CREATE TABLE quest_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL, -- e.g., 'learn_basics', 'practice_loops', 'build_project'
  step_name TEXT NOT NULL,
  step_description TEXT NOT NULL,
  step_narrative TEXT NOT NULL, -- Story text for this step
  
  -- Step progression
  step_order INTEGER NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  
  -- Step requirements
  required_actions TEXT[], -- ['complete_quiz', 'chat_with_mentor', 'upload_project']
  required_skill_nodes TEXT[], -- Skill tree nodes that must be completed
  target_metrics JSONB, -- Specific metrics to achieve (quiz score, mentor sessions, etc.)
  
  -- Step dialogue and narrative
  pre_completion_dialogue JSONB, -- Dialogue shown before step completion
  post_completion_dialogue JSONB, -- Dialogue shown after step completion
  
  -- Step rewards
  step_xp_reward INTEGER DEFAULT 25,
  step_item_rewards TEXT[], -- Cosmetic items or other rewards
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, step_order)
);

-- User progress through individual quest steps
CREATE TABLE user_quest_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_quest_id UUID REFERENCES user_quests(id) ON DELETE CASCADE,
  quest_step_id UUID REFERENCES quest_steps(id) ON DELETE CASCADE,
  
  -- Step progress
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  progress_data JSONB DEFAULT '{}', -- Step-specific progress tracking
  
  -- Completion tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_quest_id, quest_step_id)
);

-- Dialogue system for quest interactions
CREATE TABLE quest_dialogues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dialogue_key TEXT UNIQUE NOT NULL,
  npc_id UUID REFERENCES quest_npcs(id) ON DELETE CASCADE,
  
  -- Dialogue content
  dialogue_title TEXT NOT NULL,
  dialogue_text TEXT NOT NULL,
  dialogue_emotion TEXT DEFAULT 'neutral' CHECK (dialogue_emotion IN ('happy', 'encouraging', 'serious', 'proud', 'concerned', 'excited', 'mysterious')),
  
  -- Dialogue context
  context_type TEXT NOT NULL CHECK (context_type IN ('quest_start', 'quest_progress', 'quest_complete', 'general_advice', 'skill_encouragement')),
  context_data JSONB DEFAULT '{}', -- Additional context information
  
  -- Dialogue options/responses
  player_response_options JSONB, -- Multiple choice responses player can select
  
  -- Conditions for showing this dialogue
  required_user_level INTEGER DEFAULT 1,
  required_quests_completed TEXT[],
  required_skills_completed TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- QUEST CONTENT: NPCs
-- =============================================

-- Insert quest NPCs
INSERT INTO quest_npcs (npc_key, npc_name, npc_title, npc_description, npc_personality, npc_avatar_emoji, npc_avatar_color, specializes_in, quest_types, appears_at_level) VALUES

('code_sage', 'Master Syntaxis', 'The Code Sage', 'A wise mentor who has mastered all programming languages and guides newcomers on their coding journey', 'wise', '🧙‍♂️', 'purple', ARRAY['general', 'php', 'oracle'], ARRAY['main_story', 'skill_mastery'], 1),

('php_master', 'Elena Webwright', 'PHP Architect', 'A brilliant web developer who built some of the most popular PHP applications. She specializes in teaching web development mastery', 'encouraging', '👩‍💻', 'green', ARRAY['php', 'web_development'], ARRAY['main_story', 'skill_mastery', 'daily_quest'], 1),

('oracle_guardian', 'Darius Datakeeper', 'Guardian of Databases', 'The ancient keeper of database wisdom, master of SQL and Oracle systems. His knowledge spans decades of data architecture', 'serious', '🗄️', 'blue', ARRAY['oracle', 'database'], ARRAY['main_story', 'skill_mastery'], 1),

('guild_coordinator', 'Maya Connector', 'Guild Coordinator', 'A charismatic leader who helps developers find their tribes and build strong learning communities', 'happy', '👥', 'pink', ARRAY['social', 'leadership'], ARRAY['social_quest', 'daily_quest'], 3),

('challenge_master', 'Rex Questborn', 'The Challenge Master', 'A mysterious figure who appears to offer special challenges and tests to prove developer worthiness', 'mysterious', '⚔️', 'red', ARRAY['challenges', 'testing'], ARRAY['special_quest', 'seasonal'], 5);

-- =============================================
-- QUEST CONTENT: STORYLINES
-- =============================================

-- Insert quest storylines
INSERT INTO quest_storylines (storyline_key, storyline_name, storyline_description, storyline_summary, skill_focus, difficulty_level, estimated_duration_hours, completion_xp_bonus, storyline_theme, storyline_color) VALUES

('welcome_to_devpath', 'Welcome to DevPath Chronicles', 'Your first steps into the world of programming mastery', 'Begin your journey as a Code Apprentice and learn the fundamental skills needed to become a great developer', 'general', 1, 5, 200, 'adventure', 'green'),

('php_web_mastery', 'The Path of Web Mastery', 'Master the art of PHP web development from basics to advanced frameworks', 'Join Elena Webwright on an epic journey to become a PHP master, building real applications and learning industry best practices', 'php', 3, 40, 1000, 'web', 'purple'),

('oracle_database_trials', 'The Oracle Database Trials', 'Ancient tests to prove your mastery of database systems', 'Face the trials set by Darius Datakeeper to earn the title of Database Guardian and master the mysteries of Oracle', 'oracle', 4, 50, 1200, 'mystical', 'blue'),

('full_stack_ascension', 'The Full-Stack Ascension', 'The ultimate challenge: master both frontend and backend development', 'Combine the wisdom of all masters to achieve the legendary rank of Full-Stack Hero', 'full_stack', 5, 80, 2000, 'epic', 'gold');

-- =============================================
-- QUEST CONTENT: SAMPLE QUESTS
-- =============================================

-- Insert sample quests
INSERT INTO quests (quest_key, title, description, narrative_text, quest_type, required_level, objectives, xp_reward, quest_giver_name, quest_giver_avatar, estimated_duration_hours, difficulty_rating) VALUES

('first_steps', 'First Steps into Code', 'Learn the basic concepts of programming and complete your first coding challenge', 
'Welcome, young apprentice! I am Master Syntaxis, and I will be your guide on this incredible journey. Every great developer started exactly where you are now - curious, eager, and ready to learn. Your first quest is simple but important: master the fundamentals that will serve as the foundation for everything else you will learn.', 
'main_story', 1, 
'[
  {"id": "learn_basics", "description": "Complete the Programming Logic skill", "target_type": "skill_complete", "target_value": 1, "current_progress": 0, "is_completed": false},
  {"id": "first_quiz", "description": "Take your first quiz", "target_type": "quiz_score", "target_value": 70, "current_progress": 0, "is_completed": false},
  {"id": "meet_mentor", "description": "Have a chat with the AI mentor", "target_type": "mentor_sessions", "target_value": 1, "current_progress": 0, "is_completed": false}
]', 
150, 'Master Syntaxis', '🧙‍♂️', 3, 1),

('php_awakening', 'The PHP Awakening', 'Discover the power of PHP and begin your web development journey', 
'Greetings, future web architect! I am Elena Webwright, and I have been building web applications since the early days of the internet. PHP is not just a programming language - it is the key to unlocking the dynamic web. Are you ready to learn how to bring websites to life with server-side magic?', 
'main_story', 2, 
'[
  {"id": "php_basics", "description": "Master PHP Fundamentals skill", "target_type": "skill_complete", "target_value": 1, "current_progress": 0, "is_completed": false},
  {"id": "html_css", "description": "Learn HTML & CSS Basics", "target_type": "skill_complete", "target_value": 1, "current_progress": 0, "is_completed": false},
  {"id": "practice_quiz", "description": "Score 80% or higher on PHP basics quiz", "target_type": "quiz_score", "target_value": 80, "current_progress": 0, "is_completed": false}
]', 
300, 'Elena Webwright', '👩‍💻', 8, 2),

('database_calling', 'The Database Calling', 'Hear the ancient call of data and begin your Oracle journey', 
'Young seeker of knowledge, I am Darius Datakeeper, Guardian of the Database Realm. For centuries, I have watched over the sacred data that powers our digital world. The databases call to you - they whisper of structure, relationships, and the power to organize chaos into meaningful information. Will you answer their call?', 
'main_story', 2, 
'[
  {"id": "sql_foundation", "description": "Complete SQL Fundamentals skill", "target_type": "skill_complete", "target_value": 1, "current_progress": 0, "is_completed": false},
  {"id": "data_modeling", "description": "Learn Data Modeling principles", "target_type": "skill_complete", "target_value": 1, "current_progress": 0, "is_completed": false},
  {"id": "oracle_architecture", "description": "Understand Oracle Architecture", "target_type": "skill_complete", "target_value": 1, "current_progress": 0, "is_completed": false}
]', 
350, 'Darius Datakeeper', '🗄️', 10, 3),

('guild_initiation', 'The Guild Initiation', 'Join a developer guild and learn the power of community', 
'Hello there, aspiring developer! I am Maya Connector, and my mission is to help talented individuals like you find their place in our vibrant community. No developer is an island - we grow stronger together, learn faster in groups, and achieve more when we support each other. Are you ready to find your tribe?', 
'social', 3, 
'[
  {"id": "join_guild", "description": "Join a developer guild", "target_type": "guild_join", "target_value": 1, "current_progress": 0, "is_completed": false},
  {"id": "guild_challenge", "description": "Complete a guild challenge", "target_type": "guild_challenge", "target_value": 1, "current_progress": 0, "is_completed": false},
  {"id": "help_member", "description": "Help a fellow guild member", "target_type": "social_interaction", "target_value": 1, "current_progress": 0, "is_completed": false}
]', 
250, 'Maya Connector', '👥', 5, 2),

('masters_challenge', 'The Master\'s Challenge', 'Face the ultimate test to prove your programming mastery', 
'So... you think you are ready for the ultimate test? I am Rex Questborn, the Challenge Master, and I do not give out my trials lightly. Many have attempted my challenges, but few have succeeded. This is not for the faint of heart - only true masters of code can complete what I have prepared. Do you dare to face the Master\'s Challenge?', 
'special', 8, 
'[
  {"id": "perfect_scores", "description": "Achieve 3 perfect quiz scores", "target_type": "perfect_quiz", "target_value": 3, "current_progress": 0, "is_completed": false},
  {"id": "skill_mastery", "description": "Master 5 different skills", "target_type": "skill_mastered", "target_value": 5, "current_progress": 0, "is_completed": false},
  {"id": "mentor_wisdom", "description": "Have 20 mentor chat sessions", "target_type": "mentor_sessions", "target_value": 20, "current_progress": 0, "is_completed": false}
]', 
1000, 'Rex Questborn', '⚔️', 25, 5);

-- =============================================
-- QUEST CONTENT: QUEST STEPS
-- =============================================

-- Insert quest steps for "First Steps into Code"
INSERT INTO quest_steps (quest_id, step_key, step_name, step_description, step_narrative, step_order, required_actions, step_xp_reward) VALUES
((SELECT id FROM quests WHERE quest_key = 'first_steps'), 'welcome', 'Welcome to DevPath', 'Meet Master Syntaxis and learn about your journey', 'Welcome, young apprentice! I sense great potential in you. The path of a developer is challenging but incredibly rewarding. Let me explain what lies ahead and how I will guide you on this journey.', 1, ARRAY['view_introduction'], 25),

((SELECT id FROM quests WHERE quest_key = 'first_steps'), 'learn_fundamentals', 'Master the Fundamentals', 'Complete the Programming Logic skill to understand basic programming concepts', 'Every great developer must master the fundamentals. Logic is the foundation upon which all programming is built. Complete the Programming Logic skill, and you will understand how computers think and how to communicate with them.', 2, ARRAY['complete_skill'], 50),

((SELECT id FROM quests WHERE quest_key = 'first_steps'), 'first_test', 'Your First Test', 'Take a quiz to prove your understanding', 'Knowledge without testing is like a sword without sharpening. Take your first quiz and prove that you have truly understood the concepts. Do not worry about perfection - this is about learning and growth.', 3, ARRAY['complete_quiz'], 50),

((SELECT id FROM quests WHERE quest_key = 'first_steps'), 'seek_wisdom', 'Seek Wisdom', 'Chat with the AI mentor to get personalized guidance', 'A wise developer knows when to seek guidance. Our AI mentor is always available to help you understand concepts, answer questions, and provide encouragement. Have your first conversation and discover this valuable resource.', 4, ARRAY['mentor_session'], 25);

-- Insert quest steps for "PHP Awakening"  
INSERT INTO quest_steps (quest_id, step_key, step_name, step_description, step_narrative, step_order, required_actions, step_xp_reward) VALUES
((SELECT id FROM quests WHERE quest_key = 'php_awakening'), 'php_introduction', 'The World of PHP', 'Learn about PHP and its role in web development', 'PHP powers millions of websites across the internet. From small personal blogs to massive e-commerce platforms, PHP is the engine that brings the web to life. Let me show you the power you are about to harness.', 1, ARRAY['view_skill_intro'], 50),

((SELECT id FROM quests WHERE quest_key = 'php_awakening'), 'master_php_basics', 'Master PHP Syntax', 'Complete the PHP Fundamentals skill', 'Now it is time to get your hands dirty with actual PHP code. Master the syntax, understand variables and functions, and learn how PHP processes web requests. This is where your web development journey truly begins.', 2, ARRAY['complete_skill'], 100),

((SELECT id FROM quests WHERE quest_key = 'php_awakening'), 'web_foundations', 'Build Web Foundations', 'Learn HTML & CSS to complement your PHP skills', 'A PHP developer must understand the frontend as well as the backend. Master HTML and CSS so you can create beautiful interfaces that your PHP code will power. Full-stack thinking starts here.', 3, ARRAY['complete_skill'], 75),

((SELECT id FROM quests WHERE quest_key = 'php_awakening'), 'prove_mastery', 'Prove Your Mastery', 'Score highly on the PHP quiz', 'Knowledge is proven through testing. Take the PHP quiz and show me that you have truly mastered these concepts. Aim high - a score of 80% or better will prove you are ready for the next level.', 4, ARRAY['quiz_score_80'], 75);

-- =============================================
-- QUEST CONTENT: DIALOGUES
-- =============================================

-- Insert quest dialogues
INSERT INTO quest_dialogues (dialogue_key, npc_id, dialogue_title, dialogue_text, dialogue_emotion, context_type, player_response_options) VALUES

('sage_welcome', (SELECT id FROM quest_npcs WHERE npc_key = 'code_sage'), 'Welcome, Young Apprentice', 'Ah, I have been expecting you! The cosmic code patterns told me a new apprentice would arrive today. I am Master Syntaxis, keeper of programming wisdom and guide for those brave enough to embark on the developer\'s path. Are you ready to begin your transformation from curious learner to skilled coder?', 'encouraging', 'quest_start', 
'[
  {"option": "I am ready to learn!", "response": "Excellent! Your enthusiasm will serve you well on this journey."},
  {"option": "I am a bit nervous...", "response": "Fear not! Every master was once a beginner. I will guide you every step of the way."},
  {"option": "What exactly will I learn?", "response": "You will master the fundamental concepts that all great developers know, starting with the very basics of programming logic."}
]'),

('php_master_greeting', (SELECT id FROM quest_npcs WHERE npc_key = 'php_master'), 'The Web Awaits', 'Welcome to my domain, future web architect! I am Elena Webwright, and I have been crafting web experiences for over a decade. PHP is not just code - it is the magic that makes websites think, remember, and interact with users. When you master PHP, you hold the power to build anything from simple websites to complex web applications that serve millions of users.', 'excited', 'quest_start',
'[
  {"option": "I want to build amazing websites!", "response": "Perfect! That passion will fuel your learning journey."},
  {"option": "PHP seems complicated...", "response": "Every powerful tool seems complex at first, but I will break it down into simple, manageable steps."},
  {"option": "What makes PHP special?", "response": "PHP powers over 75% of the web! It is flexible, powerful, and perfect for both beginners and experts."}
]'),

('oracle_guardian_meeting', (SELECT id FROM quest_npcs WHERE npc_key = 'oracle_guardian'), 'Guardian of Ancient Data', 'Greetings, seeker of data wisdom. I am Darius Datakeeper, and I have guarded the sacred knowledge of databases for longer than most technologies have existed. Data is the lifeblood of our digital world, and those who master its organization and retrieval hold great power. The Oracle systems I will teach you are used by the world\'s largest corporations to manage billions of records. Are you prepared for such responsibility?', 'serious', 'quest_start',
'[
  {"option": "I am ready for the responsibility!", "response": "Good. Responsibility and precision are essential qualities for a database guardian."},
  {"option": "That sounds intimidating...", "response": "As it should. But do not let intimidation become fear. I will teach you to handle data with confidence."},
  {"option": "Why is database knowledge so important?", "response": "Because without proper data management, even the most beautiful applications are useless. Data is the foundation of everything."}
]'),

('guild_coordinator_intro', (SELECT id FROM quest_npcs WHERE npc_key = 'guild_coordinator'), 'The Power of Community', 'Hello there, brilliant developer! I am Maya Connector, and my superpower is bringing amazing people together. I have seen countless developers transform their careers by finding the right community, the right mentors, and the right collaborative projects. Solo coding has its place, but the real magic happens when talented individuals combine their skills and support each other\'s growth!', 'happy', 'quest_start',
'[
  {"option": "I love working with others!", "response": "Wonderful! Your collaborative spirit will make you a valuable guild member."},
  {"option": "I prefer working alone...", "response": "I understand, but you might be surprised how much faster you grow with the right team support."},
  {"option": "How do guilds work exactly?", "response": "Guilds are like study groups, but better! You work on challenges together, share knowledge, and celebrate each other\'s victories."}
]'),

('challenge_master_warning', (SELECT id FROM quest_npcs WHERE npc_key = 'challenge_master'), 'The Ultimate Test Awaits', 'You have made it far, developer. Farther than most dare to venture. I am Rex Questborn, and I exist to separate the truly dedicated from the merely curious. My challenges are not for everyone - they require skill, determination, and an unwavering commitment to excellence. Many have attempted my trials. Few have emerged victorious. The question is not whether you CAN complete my challenge... but whether you WILL.', 'mysterious', 'quest_start',
'[
  {"option": "I accept your challenge!", "response": "Bold words. Let us see if your skills match your courage."},
  {"option": "What exactly is required?", "response": "Perfection. Mastery. Dedication. Nothing less will suffice."},
  {"option": "Maybe I am not ready yet...", "response": "Wisdom in knowing one\'s limits. Return when you have honed your skills further."}
]');

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Quest system lookups
CREATE INDEX idx_quest_npcs_specialization ON quest_npcs USING GIN (specializes_in);
CREATE INDEX idx_quest_storylines_skill_focus ON quest_storylines(skill_focus);
CREATE INDEX idx_quest_steps_quest_order ON quest_steps(quest_id, step_order);
CREATE INDEX idx_user_quest_steps_user_quest ON user_quest_steps(user_quest_id);
CREATE INDEX idx_quest_dialogues_npc ON quest_dialogues(npc_id);
CREATE INDEX idx_quest_dialogues_context ON quest_dialogues(context_type);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on user-specific tables
ALTER TABLE user_quest_steps ENABLE ROW LEVEL SECURITY;

-- User can only access their own quest step progress
CREATE POLICY "Users can manage their quest step progress" ON user_quest_steps
  FOR ALL USING (
    user_quest_id IN (
      SELECT id FROM user_quests WHERE user_id = auth.uid()
    )
  );

-- Public read access to quest content
CREATE POLICY "Anyone can view quest NPCs" ON quest_npcs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view quest storylines" ON quest_storylines
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view quest steps" ON quest_steps
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view quest dialogues" ON quest_dialogues
  FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS FOR QUEST SYSTEM
-- =============================================

-- Function to check if user meets quest requirements
CREATE OR REPLACE FUNCTION check_quest_requirements(p_user_id UUID, p_quest_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  quest_record RECORD;
  user_level INTEGER;
  user_skills_completed INTEGER;
BEGIN
  -- Get quest details
  SELECT * INTO quest_record FROM quests WHERE id = p_quest_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Get user level
  SELECT 
    CASE 
      WHEN current_level = 'Code Apprentice' THEN 1
      WHEN current_level = 'Bug Hunter' THEN 2
      WHEN current_level = 'Logic Architect' THEN 3
      WHEN current_level = 'Code Wizard' THEN 4
      WHEN current_level = 'Dev Sage' THEN 5
      ELSE 1
    END
  INTO user_level
  FROM user_xp 
  WHERE user_id = p_user_id;
  
  user_level := COALESCE(user_level, 1);
  
  -- Check level requirement
  IF user_level < quest_record.required_level THEN
    RETURN FALSE;
  END IF;
  
  -- Check prerequisite quests
  IF quest_record.prerequisite_quests IS NOT NULL AND array_length(quest_record.prerequisite_quests, 1) > 0 THEN
    SELECT COUNT(*)
    INTO user_skills_completed
    FROM user_quests uq
    WHERE uq.user_id = p_user_id 
    AND uq.status = 'completed'
    AND EXISTS (
      SELECT 1 FROM quests q 
      WHERE q.id = uq.quest_id 
      AND q.quest_key = ANY(quest_record.prerequisite_quests)
    );
    
    IF user_skills_completed < array_length(quest_record.prerequisite_quests, 1) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically unlock available quests for user
CREATE OR REPLACE FUNCTION unlock_available_quests(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  quest_record RECORD;
  quests_unlocked INTEGER := 0;
BEGIN
  -- Check each quest for unlock eligibility
  FOR quest_record IN 
    SELECT * FROM quests 
    WHERE id NOT IN (
      SELECT quest_id FROM user_quests WHERE user_id = p_user_id
    )
  LOOP
    -- Check if user meets requirements
    IF check_quest_requirements(p_user_id, quest_record.id) THEN
      -- Create user quest record
      INSERT INTO user_quests (user_id, quest_id, status)
      VALUES (p_user_id, quest_record.id, 'available');
      
      quests_unlocked := quests_unlocked + 1;
    END IF;
  END LOOP;

  RETURN quests_unlocked;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Quest Narrative System Installation Complete!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- 5 Quest NPCs with Unique Personalities';
  RAISE NOTICE '- 4 Epic Quest Storylines';
  RAISE NOTICE '- 5 Sample Quests with Full Narratives';
  RAISE NOTICE '- Quest Steps & Dialogue System';
  RAISE NOTICE '- Automatic Quest Unlocking';
  RAISE NOTICE '- RLS Security Policies';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'NPCs: Code Sage, PHP Master, Oracle Guardian, Guild Coordinator, Challenge Master';
  RAISE NOTICE 'Ready for Quest UI Components!';
  RAISE NOTICE '====================================';
END $$;