# Setup Guide - AI Mentor Chat System

## 🚀 Complete Setup Instructions

This guide will help you set up the AI Mentor Chat System with all its features including authentication, AI chat, learning paths, and database integration.

## 📋 Prerequisites

1. **Node.js 20+** - Latest LTS version
2. **Docker & Docker Compose** - For containerized development
3. **Supabase Account** - Free tier available at [supabase.com](https://supabase.com)
4. **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com)
5. **Git** - For version control

## 🔧 Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/swanniegit/ai-helper.git
cd ai-helper

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set Up Database Tables**:
   - Go to your **Supabase Dashboard**
   - Navigate to **SQL Editor**
   - Copy the entire content from `scripts/setup-database.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the script

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_TELEMETRY_DISABLED=1
CUSTOM_KEY=your-custom-key-here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Start Development Server

#### Option A: Local Development
```bash
npm run dev
```

#### Option B: Docker Development
```bash
# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

### 5. Test the System

1. **Open** `http://localhost:3000`
2. **Register** a new account at `/login`
3. **Login** with your credentials
4. **Access** the AI mentor chat at `/chat`
5. **Create** learning paths at `/learning-paths/new`

## 🎯 What the Setup Script Does

The `scripts/setup-database.sql` script creates:

- **Users table** - For user accounts and authentication
- **User sessions** - For secure session management with JWT
- **Learning paths** - For storing career paths and goals
- **Skill assessments** - For tracking user skills and levels
- **Career goals** - For user-defined objectives and timelines
- **Learning plans** - For AI-generated learning plans with quarters
- **Progress tracking** - For monitoring milestone completion
- **Chat sessions** - For conversation history and context
- **Conversation history** - For detailed chat message storage
- **All necessary indexes** - For optimal database performance
- **Row Level Security (RLS)** - For data protection and access control

## 🔍 Troubleshooting

### Authentication Issues

1. **"Failed to create user" Error**:
   - Verify database tables are created in Supabase
   - Check RLS policies are properly configured
   - Ensure environment variables are correct

2. **Login Problems**:
   - Verify Supabase URL and anon key
   - Check JWT_SECRET is set correctly
   - Ensure user sessions table exists

### Database Issues

1. **Connection Errors**:
   - Verify Supabase project is active
   - Check network connectivity
   - Ensure API keys are valid

2. **RLS Policy Errors**:
   - Run the RLS fix scripts if needed
   - Check Supabase dashboard for policy status
   - Verify user permissions

### AI Chat Issues

1. **OpenAI API Errors**:
   - Verify OPENAI_API_KEY is valid
   - Check API quota and billing
   - Ensure proper API endpoint configuration

2. **Context Loading Issues**:
   - Check user profile data exists
   - Verify career path selection
   - Ensure learning progress is tracked

### Common Solutions

```bash
# Restart Docker containers
docker-compose down
docker-compose up -d --build

# Check application logs
docker-compose logs -f app

# Verify environment variables
cat .env.local

# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"
```

## ✅ Success Indicators

After successful setup, you should be able to:

1. ✅ **Register** a new user account at `/login`
2. ✅ **Login** with the created account
3. ✅ **Access** the dashboard at `/dashboard`
4. ✅ **Chat** with AI mentor at `/chat`
5. ✅ **Create** learning paths at `/learning-paths/new`
6. ✅ **Select** career paths (PHP/Oracle)
7. ✅ **Generate** AI-powered learning plans
8. ✅ **Track** progress and milestones

## 🚀 Next Steps

Once everything is working:

1. **Explore the AI Mentor Chat**:
   - Try different chat modes (General, Code Review, Interview Prep, Motivation)
   - Ask career-related questions
   - Get personalized guidance

2. **Create Your Learning Path**:
   - Select your career track (PHP or Oracle)
   - Complete the skills assessment
   - Set your career goals and timeline
   - Generate your personalized roadmap

3. **Track Your Progress**:
   - Monitor milestone completion
   - Review quarterly objectives
   - Update your skills and goals

4. **Advanced Features**:
   - Use code review for PHP/SQL/PL/SQL
   - Practice interview questions
   - Get daily motivation and tips

## 📚 Additional Resources

- **[Context and Memory System](CONTEXT_AND_MEMORY.md)** - Understand how the AI remembers and personalizes responses
- **[CSS Styling Guide](CSS_STYLING_GUIDE.md)** - Learn about the design system and styling
- **[Learning Path Implementation](learning-path.md)** - Detailed feature documentation
- **[Technical Implementation Handbook](Technical%20Implementation%20Handbook.docx.md)** - Complete technical guide

The system is now ready to provide personalized career guidance and learning experiences! 🎉 