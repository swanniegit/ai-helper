# Database Setup Fix for 500 Internal Server Errors

## Problem
Your application is experiencing 500 Internal Server Errors on multiple API endpoints because the required database tables don't exist in your deployed Supabase database.

## Solution

### Step 1: Set up the complete database schema

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the complete schema setup**
   - Copy the contents of `database/complete-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

   **OR**

   - Copy the contents of `scripts/setup-complete-database.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

### Step 2: Verify the tables were created

After running the script, you should see:
- A success message: "Complete database schema setup completed successfully!"
- All the required tables should be created in the "Table Editor"

### Step 3: Check environment variables

Make sure your environment variables are properly set in your Vercel deployment:

1. **Go to your Vercel Dashboard**
   - Navigate to your project
   - Go to "Settings" → "Environment Variables"

2. **Verify these variables are set:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret
   ```

3. **Redeploy if needed**
   - If you added new environment variables, redeploy your application

### Step 4: Test the endpoints

After setting up the database, test these endpoints:

1. **Quiz Generation**: `POST /api/quiz/generate`
2. **Guilds**: `GET /api/social/guilds`
3. **Leaderboard**: `GET /api/social/leaderboard`
4. **Daily Challenges**: `GET /api/social/challenges/daily`

## Tables Created

The script creates all necessary tables for:

### Authentication
- `users` - User accounts
- `user_sessions` - Session management

### Learning Path System
- `learning_paths` - User learning paths
- `skill_assessments` - Skills assessment data
- `career_goals` - Career goals
- `priority_areas` - Priority learning areas
- `learning_plans` - Generated learning plans
- `plan_quarters` - Plan quarters
- `progress_tracking` - Progress tracking

### Quiz System
- `quiz_templates` - Quiz templates
- `quiz_questions` - Question bank
- `quiz_results` - Quiz results
- `quiz_sessions` - Active quiz sessions
- `quiz_analytics` - Detailed analytics
- `user_quiz_preferences` - User preferences

### Gamification System
- `user_xp` - User XP and levels
- `badge_definitions` - Badge definitions
- `user_achievements` - User achievements
- `xp_transactions` - XP transaction log
- `user_streaks` - Streak tracking

### Social Competition System
- `leaderboards` - Anonymous leaderboards
- `guilds` - Study guilds
- `guild_memberships` - Guild memberships
- `challenge_templates` - Challenge templates
- `user_daily_challenges` - User daily challenges
- `anonymous_names` - Anonymous names for leaderboards

### Seasonal Events System
- `seasonal_events` - Seasonal event definitions
- `user_seasonal_progress` - User progress in seasonal events

## Troubleshooting

### If you still get 500 errors:

1. **Check Supabase logs**
   - Go to Supabase Dashboard → Logs
   - Look for any database errors

2. **Verify RLS policies**
   - The script creates Row Level Security policies
   - Make sure your service role key has proper permissions

3. **Test database connection**
   - Use the test endpoint: `GET /api/test-connection`
   - Check if it returns a successful connection

4. **Check environment variables**
   - Ensure all required environment variables are set
   - Verify the values are correct

### Common Issues:

1. **"relation does not exist" errors**
   - The tables weren't created properly
   - Re-run the schema setup script

2. **"permission denied" errors**
   - RLS policies are blocking access
   - Check that your service role key has proper permissions

3. **"authentication failed" errors**
   - Environment variables are incorrect
   - Verify your Supabase URL and keys

## Next Steps

After fixing the database issues:

1. **Test all features** to ensure they work properly
2. **Monitor the application** for any remaining errors
3. **Set up proper monitoring** for production use

## Support

If you continue to experience issues:

1. Check the Supabase logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure the database schema was created successfully
4. Test the database connection using the test endpoints 