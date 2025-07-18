# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive Next.js 14 application featuring an AI-powered career mentor chat system with personalized learning paths, career frameworks, and interactive guidance for PHP and Oracle developers. The application uses TypeScript, Tailwind CSS, Supabase for database/auth, and OpenAI GPT-4 for AI features.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Install dependencies
npm install
```

### Code Quality
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format

# Check formatting
npm run format:check
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Docker Commands
```bash
# Build and start development containers
npm run docker:dev

# Build and start with rebuild
npm run docker:dev:build

# Stop all containers
npm run docker:stop

# Clean Docker system
npm run docker:clean

# Build production Docker image
npm run docker:build

# Run production Docker container
npm run docker:run
```

## Architecture

### Tech Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for database, authentication, and RLS
- **OpenAI GPT-4** for AI mentor functionality
- **React 18** with modern hooks
- **PostgreSQL** with Row Level Security policies

### Key Directories
- `app/` - Next.js 14 app directory with route groups
- `components/` - Reusable React components
- `lib/` - Utility functions and services
- `types/` - TypeScript type definitions
- `database/` - SQL schema and migrations
- `docs/` - Documentation files

### Authentication System
- Uses Supabase auth with JWT session management
- Custom session handling in `lib/auth/authService.ts`
- Protected routes with `ProtectedRoute` component
- Row Level Security (RLS) policies on all tables

### AI Features
- OpenAI GPT-4 integration for mentor chat
- Context-aware responses based on user profiles
- Career framework integration (PHP/Oracle paths)
- Multi-mode interactions (code review, interview prep, motivation)

### Learning Path System
- 4-step wizard process for creating personalized learning paths
- AI-powered plan generation with quarterly breakdowns
- Skills assessment and progress tracking
- Database schema supports complex learning structures

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `user_sessions` - JWT session management
- `skills_assessments` - User skills and levels
- `user_goals` - Career goals and timelines
- `learning_plans` - Generated learning plans
- `learning_plan_quarters` - Quarterly plan breakdowns
- `progress_tracking` - Milestone completion tracking
- `quiz_results` - Assessment results
- `conversation_history` - Chat message storage

### Important Notes
- All tables have Row Level Security (RLS) enabled
- User data is isolated by `user_id`
- Several RLS fix scripts available in root directory
- Database schema is in `database/schema.sql`

## Environment Variables

Required environment variables for development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_TELEMETRY_DISABLED=1
CUSTOM_KEY=your-custom-key-here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Key Components

### AI Mentor Chat (`components/AIMentorChat.tsx`)
- Main chat interface with GPT-4 integration
- Multiple chat modes (General, Code Review, Interview Prep, Motivation)
- Context-aware responses based on user career path
- Real-time message handling with typing indicators

### Learning Path Wizard (`components/LearningPathWizard.tsx`)
- 4-step wizard for creating personalized learning paths
- Skills assessment, goal setting, and AI plan generation
- Integrates with OpenAI for intelligent plan creation
- Saves to database with proper user isolation

### Navigation (`components/Navigation.tsx`)
- Responsive navigation with route groups
- User authentication state management
- Dashboard sidebar with feature access

### Protected Route (`components/ProtectedRoute.tsx`)
- Wrapper for authenticated pages
- Session validation and redirection
- Integrates with Supabase auth

## API Routes

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user info
- `POST /api/auth/logout` - Session cleanup

### Learning Paths
- `POST /api/generate-learning-path` - AI-powered plan generation
- `GET /api/learning-paths` - User's learning paths

### Mentor Chat
- `POST /api/mentor/chat` - AI mentor conversations

### Quiz System
- `POST /api/quiz/generate` - Generate assessment quizzes
- `POST /api/quiz/submit` - Submit quiz responses
- `GET /api/quiz/progress` - Track quiz progress

## Development Practices

### Code Style
- Follow TypeScript best practices
- Use Tailwind CSS for styling (no custom CSS unless necessary)
- Component-based architecture with clear separation of concerns
- Error handling with try-catch blocks
- Type safety with proper interfaces

### Database Operations
- Always use Supabase client for database operations
- Ensure RLS policies are properly configured
- Use proper TypeScript interfaces for database types
- Handle errors gracefully with user-friendly messages

### AI Integration
- OpenAI API calls should have proper error handling
- Context management for chat conversations
- Rate limiting awareness for API usage
- Fallback responses for API failures

## Security Considerations

- All API routes validate user authentication
- Database queries use RLS for data isolation
- Environment variables for sensitive data
- Input validation on all forms
- XSS protection through React's built-in escaping
- JWT tokens stored securely with HTTP-only cookies

## Testing

- Jest configuration in `jest.config.js`
- Test setup in `jest.setup.js`
- Basic tests in `__tests__/` directory
- Use React Testing Library for component tests
- Integration tests for API routes

## Deployment

- Docker configuration for containerized deployment
- GitHub Actions workflows for CI/CD
- Environment-specific configurations
- Database migrations and setup scripts
- Production-ready with proper error handling

## Common Issues and Solutions

### Database Connection Issues
- Check Supabase credentials in environment variables
- Verify RLS policies are properly configured
- Use RLS fix scripts if needed (multiple .sql files in root)

### OpenAI API Issues
- Verify API key is valid and has sufficient credits
- Check rate limits and usage
- Implement fallback responses for API failures

### Authentication Problems
- Ensure JWT_SECRET is set correctly
- Check Supabase auth configuration
- Verify session management in `authService.ts`

## UI/UX Theme and Component Library Evaluation

### Rule: UI/UX Theme and Component Library Evaluation

**Objective:**
Analyze and recommend the most suitable UI component library or theme based on project context, adhering to modern UI/UX principles. The primary goal is to ensure the final selection promotes usability, accessibility, performance, and a cohesive user experience.

**Trigger:**
This rule is activated when asked to "find a UI theme," "recommend a component library," or similar requests.

**Phase 1: Contextual Discovery & Filtering**

Before searching, understand the project's core requirements using these placeholders:

- **[TECH_STACK]**: Next.js, TypeScript, Tailwind CSS, and Supabase
- **[PROJECT_TYPE]**: Agenic Assistant like
- **[DESIGN_AESTHETIC]**: Strong but metro with light green to dark grey gradients

**Action:**
1. Perform targeted search for "UI component libraries for [TECH_STACK]," "best design systems for [PROJECT_TYPE]," and "[DESIGN_AESTHETIC] CSS frameworks"
2. Identify 3-5 promising candidates from search results
3. Initial filtering: Discard candidates not updated in last 12 months or with overwhelmingly negative feedback

**Phase 2: Deep Analysis & Scoring**

Analyze each filtered candidate against these UI/UX criteria:

1. **Accessibility (A11y) - Weight: 30%**
   - WCAG 2.1 AA or higher commitment
   - Keyboard navigation support
   - Appropriate ARIA roles and states
   - Sufficient color contrast in default theme

2. **Design Philosophy & Consistency - Weight: 25%**
   - Clear, documented design system
   - Visual and functional consistency across components
   - Clear usage guidelines for typography, spacing, and color palettes

3. **Component Quality & Documentation - Weight: 20%**
   - Comprehensive component library for project type
   - Clear documentation with live, interactive examples
   - Intuitive and well-documented component API

4. **Performance & Lightweightness - Weight: 15%**
   - Bundle size analysis
   - Tree-shaking support
   - Minimal dependencies on large libraries

5. **Customizability & Theming - Weight: 10%**
   - Easy custom brand identity application
   - Modern CSS features (variables) for theming
   - Override component styles without specificity wars

**Phase 3: Final Recommendation & Usage Guidelines**

**Action:**
1. **Synthesize Findings**: Present summary table comparing candidates
2. **Top Recommendation**: State top recommendation with justification for project context
3. **Best Practices for Usage**: Generate actionable implementation rules including:
   - Starter code snippet for installation and basic setup
   - "Adhere to the system's spacing and typography scale" for visual rhythm
   - "Favor composition over modification" warning
   - "Use the theme's provided color palette for states" guideline
   - "Always test key user flows for keyboard accessibility" reminder

## Documentation References

- `README.md` - Complete project overview and setup
- `SETUP.md` - Detailed setup instructions
- `CSS_STYLING_GUIDE.md` - Comprehensive styling documentation
- `docs/LEARNING_PATH_SYSTEM.md` - Learning path implementation details
- `CONTEXT_AND_MEMORY.md` - AI mentor context system