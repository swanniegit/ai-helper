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

# Run a single test file
npm test -- --testPathPattern=<filename>

# Run tests matching a specific pattern
npm test -- --testNamePattern="<test name pattern>"
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

# Debug mode with inspector
npm run dev:debug
npm run docker:debug

# View container logs
npm run logs
npm run logs:debug
```

## Architecture

### Tech Stack
- **Next.js 14** with App Router (standalone output for Docker)
- **TypeScript** in strict mode for maximum type safety
- **Tailwind CSS** with shadcn/ui component library
- **Supabase** for database, authentication, storage, and RLS
- **OpenAI GPT-4** for AI mentor functionality
- **React 18** with Server Components and Client Components
- **PostgreSQL** with comprehensive Row Level Security policies
- **Class Variance Authority (CVA)** for component variants
- **Jest + React Testing Library** for testing
- **Husky + lint-staged** for pre-commit hooks

### Key Directories
- `app/` - Next.js 14 app directory with route groups:
  - `(dashboard)/` - Protected dashboard pages with shared layout
  - `api/` - API routes for auth, learning paths, mentor chat, quiz system
  - `login/`, `logout/` - Authentication pages
- `components/` - React components:
  - `ui/` - shadcn/ui base components (Button, Card, Dialog, Input)
  - Feature components (AIMentorChat, LearningPathWizard, Navigation)
  - `quiz/` - Quiz system components
  - `gamification/` - Gamification system components (avatars, achievements, quests)
- `lib/` - Business logic and services:
  - `auth/` - Custom JWT authentication with React Context
  - `mentor/`, `quiz/` - Feature-specific services
  - `gamification/` - Gamification services (avatars, quests, social features)
  - `supabaseClient.ts` - Database configuration
- `types/` - Comprehensive TypeScript interfaces
- `database/` - PostgreSQL schema, migrations, and RLS fix scripts

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
- **4-step wizard process**: Skills assessment → Goal setting → AI plan generation → Progress tracking
- **AI-powered plan generation** with OpenAI GPT-4 integration
- **Quarterly breakdowns** with detailed milestones and timelines
- **Complex database schema**: Multi-table structure with learning_plans, learning_plan_quarters, progress_tracking
- **Skills assessment integration** with career framework mapping

### Quiz System Architecture
- **Comprehensive quiz engine** with templates, sessions, and analytics
- **AI-powered question generation** using OpenAI
- **Real-time progress tracking** with detailed feedback
- **Multiple question types** and difficulty levels
- **Session management** with database persistence
- **Quiz templates** with fallback systems for reliability

### Gamification System Architecture
- **Avatar system** with customization and presets
- **XP and leveling** with progress tracking and achievements
- **Daily challenges** and streak tracking
- **Social features** including guilds and leaderboards  
- **Quest system** with NPC dialogue and interactive activities
- **Seasonal events** with time-limited challenges
- **Skill trees** for structured learning progression

## Database Schema

### Core Tables
- `users` - User accounts and profiles with career framework data
- `user_sessions` - JWT session management with database persistence
- `skills_assessments` - User skills and proficiency levels
- `user_goals` - Career goals with timelines and priorities
- `learning_plans` - AI-generated learning plans with metadata
- `learning_plan_quarters` - Quarterly breakdowns with milestones
- `progress_tracking` - Milestone completion with timestamps
- `quiz_templates` - Reusable quiz structures with fallback templates
- `quiz_sessions` - Active quiz sessions with state management
- `quiz_results` - Detailed assessment results and analytics
- `conversation_history` - AI mentor chat message storage with context

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
- `POST /api/quiz/generate` - Generate assessment quizzes with AI integration
- `POST /api/quiz/submit` - Submit quiz responses with validation
- `GET /api/quiz/progress` - Track quiz progress and analytics
- `GET /api/quiz/templates` - Retrieve quiz templates with fallbacks
- `POST /api/quiz/session` - Manage quiz session state

### Gamification
- `GET /api/gamification/progress` - Get user's XP, level, and achievements
- `POST /api/gamification/xp` - Award XP for completed activities
- `GET /api/gamification/achievements` - Retrieve user achievements
- `GET /api/gamification/streaks` - Track daily activity streaks
- `POST /api/gamification/init` - Initialize gamification for new users

### Social & Competition
- `GET /api/social/leaderboard` - Global and guild leaderboards
- `GET /api/social/guilds` - Available guilds
- `POST /api/social/guilds/join` - Join a guild
- `GET /api/social/challenges/daily` - Daily challenges
- `POST /api/social/challenges/complete` - Complete challenge

### Quests & Skill Trees
- `GET /api/quests` - Available quests
- `POST /api/quests/start` - Start a quest
- `GET /api/quests/[questId]/details` - Quest details
- `GET /api/skill-tree/paths` - Available skill trees
- `POST /api/skill-tree/update-progress` - Update learning progress

## Critical Configuration

### Next.js Configuration (`next.config.mjs`)
- **Standalone output** for Docker containerization
- **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options
- **Server Components** with external packages configuration
- **Environment variable exposure** for runtime configuration

### Tailwind Configuration (`tailwind.config.ts`)
- **CSS Variables**: HSL-based color system with semantic naming
- **Custom Gradients**: `bg-gradient-metro` for brand consistency
- **Animation System**: fadeIn, slideInLeft, slideInRight keyframes
- **Dynamic Border Radius**: CSS custom properties for flexible theming
- **Container System**: Centered layout with responsive max-widths

### Package Configuration
- **Pre-commit Hooks**: Husky + lint-staged for code quality
- **Debug Support**: Node inspector integration for development
- **Docker Compose**: Multi-service development environment

## Development Practices

### Code Style
- Follow TypeScript best practices
- Use Tailwind CSS for styling (no custom CSS unless necessary)
- Component-based architecture with clear separation of concerns
- Error handling with try-catch blocks
- Type safety with proper interfaces

### Pre-Deployment Checklist
Before committing code, always check:

#### ESLint & React Rules
- **Escape apostrophes**: Use `&apos;` instead of `'` in JSX text content
- **Quote escaping**: Use `&quot;` for quotes in JSX
- **HTML entities**: Use proper HTML entities for special characters
- **React fragments**: Use `<>` or `React.Fragment` instead of divs when possible

#### Build Validation
```bash
# Always run before committing (enforced by pre-commit hooks)
npm run lint
npm run type-check
npm run build

# Additional development checks
npm run format:check
npm test
```

#### Common ESLint Fixes
```jsx
// ❌ Wrong - will cause react/no-unescaped-entities error
<p>You haven't completed any quizzes yet.</p>

// ✅ Correct - escaped apostrophe
<p>You haven&apos;t completed any quizzes yet.</p>

// ❌ Wrong - unescaped quotes
<p>Click "Start Quiz" to begin.</p>

// ✅ Correct - escaped quotes
<p>Click &quot;Start Quiz&quot; to begin.</p>
```

#### Color Theme Compliance
- **NO blue elements**: All interactive elements must use primary green theme
- **Consistent gradients**: Use `bg-gradient-to-r from-primary to-gray-700` for buttons
- **Hover states**: Use `hover:from-primary/90 hover:to-gray-700/90`
- **Text colors**: Use `text-primary` instead of `text-blue-*`

### CSS Requirements and Styling Guidelines

#### Nightingale UI/UX Theme Evaluation Rule
When asked to recommend UI themes or component libraries, follow this evaluation process:

**Phase 1: Contextual Discovery**
- **Tech Stack**: Next.js, TypeScript, Tailwind CSS, Supabase
- **Project Type**: AI Assistant/Agentic platform
- **Design Aesthetic**: Modern metro design with light green to dark grey gradients

**Phase 2: Evaluation Criteria**
1. **Accessibility (30%)**: WCAG 2.1 AA compliance, keyboard navigation, ARIA support
2. **Design Philosophy (25%)**: Consistent design system, clear guidelines
3. **Component Quality (20%)**: Comprehensive library, clear documentation
4. **Performance (15%)**: Bundle size, tree-shaking support
5. **Customizability (10%)**: Easy theming, CSS variables support

**Phase 3: Implementation Guidelines**
- Use established spacing and typography scales
- Favor composition over heavy style modifications
- Maintain consistent color palette for states
- Always test keyboard accessibility
- Follow the project's existing design system

#### Current Styling System

**Framework & Components**
- **Base**: Tailwind CSS with shadcn/ui component library
- **Typography**: Poppins font family with weights 400, 600, 700
- **Component Library**: shadcn/ui components (Button, Card, Dialog, Input) with class-variance-authority for variants

**Color System**
- **Primary**: Green theme (`hsl(120, 25%, 35%)`) for primary actions and accents
- **Semantic Colors**: HSL-based system with CSS variables for consistent theming
- **Light/Dark Mode**: Automatic theme switching with `.dark` class support
- **Metro Gradient**: Custom gradient from light green to dark grey (`bg-gradient-metro`)

**Layout & Spacing**
- **Container**: Centered with 2rem padding, max-width 1400px on 2xl screens
- **Cards**: Backdrop blur effects with `bg-card/80 backdrop-blur-sm`
- **Animations**: Custom fadeIn, slideInLeft, slideInRight animations
- **Borders**: Dynamic radius system using CSS custom properties

**Component Patterns**
- **Navigation**: Sidebar with card-based navigation items using backdrop blur
- **Forms**: shadcn/ui Input components with proper focus states
- **Buttons**: CVA-based button variants (default, destructive, outline, secondary, ghost, link)
- **Typography**: Semantic text colors using CSS variables (foreground, muted-foreground, etc.)

**Custom Utilities**
- **Gradient Buttons**: `.btn-gradient` for metro-themed buttons
- **Animation Classes**: `.animate-fadeIn`, `.animate-slideInLeft`, `.animate-slideInRight`
- **Focus States**: Proper focus-visible ring styling with primary color
- **Responsive**: Mobile-first approach with Tailwind's responsive utilities

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


## Documentation References

- `README.md` - Complete project overview and setup
- `SETUP.md` - Detailed setup instructions
- `CSS_STYLING_GUIDE.md` - Comprehensive styling documentation
- `docs/LEARNING_PATH_SYSTEM.md` - Learning path implementation details
- `CONTEXT_AND_MEMORY.md` - AI mentor context system