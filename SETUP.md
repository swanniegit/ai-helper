# Setup Guide - AI Helper Learning Path System

## 🚨 Current Issue: "Failed to create user"

The error you're seeing is because the database tables haven't been created yet. Follow these steps to fix it:

## 📋 Prerequisites

1. **Supabase Account**: You need access to your Supabase project
2. **Environment Variables**: Make sure your `.env.local` file has the correct Supabase credentials

## 🔧 Step-by-Step Setup

### 1. Set Up Database Tables

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy the entire content from `scripts/setup-database.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the script

### 2. Verify Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENAI_API_KEY=your-openai-api-key
```

### 3. Restart Docker Containers

```bash
docker-compose down
docker-compose up -d --build
```

### 4. Test Registration

1. Go to `http://localhost:3000/login`
2. Click "create a new account"
3. Fill in the registration form
4. Should now work without the "Failed to create user" error

## 🎯 What the Setup Script Does

The `setup-database.sql` script creates:

- **Users table** - For user accounts and authentication
- **User sessions** - For secure session management
- **Learning paths** - For storing career paths and goals
- **Skill assessments** - For tracking user skills
- **Career goals** - For user-defined objectives
- **Learning plans** - For AI-generated learning plans
- **Progress tracking** - For monitoring user progress
- **All necessary indexes** - For optimal performance
- **Row Level Security** - For data protection

## 🔍 Troubleshooting

### If you still get "Failed to create user":

1. **Check Supabase Connection**:
   - Verify your Supabase URL and anon key are correct
   - Test connection in Supabase dashboard

2. **Check Database Tables**:
   - Go to Supabase → Table Editor
   - Verify the `users` table exists

3. **Check RLS Policies**:
   - Go to Supabase → Authentication → Policies
   - Verify policies are created for the `users` table

4. **Check Logs**:
   ```bash
   docker-compose logs app
   ```

### Common Issues:

- **Wrong Supabase URL**: Make sure it starts with `https://`
- **Invalid anon key**: Copy the full key from Supabase settings
- **Missing JWT_SECRET**: Add it to your environment variables
- **Database not created**: Run the setup script in Supabase SQL Editor

## ✅ Success Indicators

After successful setup, you should be able to:

1. ✅ Register a new user account
2. ✅ Login with the created account
3. ✅ Access the dashboard
4. ✅ Create learning paths
5. ✅ Select career paths (PHP/Oracle)
6. ✅ Generate AI-powered learning plans

## 🚀 Next Steps

Once registration works:

1. Create your first learning path
2. Select PHP or Oracle as your career path
3. Complete the skills assessment
4. Set your career goals
5. Generate your personalized learning plan

The system will then save everything to the database and display your learning paths on the dashboard! 