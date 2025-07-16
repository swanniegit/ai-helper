# AI Mentor Chat System

A comprehensive Next.js 14 application featuring an AI-powered career mentor chat system with personalized learning paths, career frameworks, and interactive guidance for PHP and Oracle developers.

## 🚀 Features

- **🤖 AI Mentor Chat** - GPT-4 powered virtual career mentor with context-aware responses
- **🎯 Personalized Learning Paths** - AI-generated career roadmaps with quarterly milestones
- **📚 Career Frameworks** - Comprehensive PHP and Oracle developer progression frameworks
- **💬 Interactive Chat Modes** - Code review, interview prep, daily motivation, and general guidance
- **📊 Progress Tracking** - Real-time milestone tracking and learning analytics
- **🔐 Secure Authentication** - Supabase-powered user management with JWT sessions
- **🎨 Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- **🐳 Docker Support** - Containerized development and production deployment
- **🔄 CI/CD Pipeline** - Automated testing and deployment with GitHub Actions

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - Latest React features
- **OpenAI GPT-4** - AI-powered mentor responses
- **Supabase** - Database and authentication
- **PostgreSQL** - Relational database with RLS policies
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Jest & Testing Library** - Testing framework
- **Prettier & ESLint** - Code formatting and linting

## 📦 Quick Start

### Prerequisites

- Node.js 20+ 
- Docker & Docker Compose
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd role-based-ai-platform-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Docker Development

1. **Start with Docker Compose**
   ```bash
   npm run docker:dev
   ```

2. **Or build and run manually**
   ```bash
   npm run docker:build
   npm run docker:run
   ```

3. **For development with hot reload**
   ```bash
   docker-compose --profile dev up
   ```

## 🐳 Docker Commands

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |
| `npm run docker:dev` | Start development environment |
| `npm run docker:dev:build` | Rebuild and start development |
| `npm run docker:stop` | Stop all containers |
| `npm run docker:clean` | Clean up Docker system |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler |
| `npm run test` | Run Jest tests |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## 🏗️ Project Structure

```
ai-helper/
├── app/                    # Next.js 14 app directory
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── chat/          # AI mentor chat interface
│   │   ├── dashboard/     # Main dashboard
│   │   ├── learning-paths/ # Learning path management
│   │   ├── mentor-linkup/ # Mentor connection features
│   │   ├── news-feed/     # News and updates
│   │   └── wellness-support/ # Wellness features
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── chat/          # Chat API endpoints
│   │   └── generate-learning-path/ # AI plan generation
│   ├── login/             # Authentication pages
│   ├── logout/            # Logout functionality
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ChatWindow.tsx     # Enhanced chat interface
│   ├── GoalCard.tsx       # Goal display component
│   ├── Navigation.tsx     # Navigation component
│   └── NewsTicker.tsx     # News ticker component
├── lib/                   # Utility functions
│   ├── auth/              # Authentication utilities
│   ├── supabaseClient.ts  # Supabase client configuration
│   └── mockData.ts        # Mock data for demo
├── types/                 # TypeScript type definitions
│   └── chat.ts           # Chat-related types
├── database/              # Database schema and migrations
├── docs/                  # Documentation files
├── .github/              # GitHub Actions workflows
├── Dockerfile            # Production Docker image
├── Dockerfile.dev        # Development Docker image
├── docker-compose.yml    # Docker Compose configuration
├── CONTEXT_AND_MEMORY.md # Context and memory system docs
├── CSS_STYLING_GUIDE.md  # CSS styling documentation
└── README.md             # This file
```

## 🔄 CI/CD Pipeline

The project includes a GitHub Actions workflow that:

1. **Tests** - Runs linting, type checking, and unit tests
2. **Builds** - Creates Docker images for different environments
3. **Deploys** - Automatically deploys to staging/production

### Workflow Triggers

- **Push to `main`** - Deploy to production
- **Push to `develop`** - Deploy to staging
- **Pull Request** - Run tests and build validation

## 🚀 Deployment

### Docker Deployment

1. **Build production image**
   ```bash
   docker build -t role-based-ai-platform .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 role-based-ai-platform
   ```

### Environment Variables

Create a `.env.local` file for local development with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_TELEMETRY_DISABLED=1
CUSTOM_KEY=your-custom-key-here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Authentication

The system uses Supabase for authentication with JWT session management:

- **Registration**: `/login` - Create new account
- **Login**: `/login` - Sign in with existing credentials  
- **Logout**: `/logout` - Sign out and clear session
- **Dashboard**: `/dashboard` - Main application interface

### AI Mentor Chat

Access the AI mentor chat at `/chat` with multiple interaction modes:

- **General Guidance**: Career advice and mentorship
- **Code Review**: PHP/SQL/PL/SQL code analysis and improvements
- **Interview Prep**: Mock interviews and preparation tips
- **Daily Motivation**: Personalized encouragement and tips

### Learning Paths

Generate personalized learning paths at `/learning-paths/new`:

1. **Career Path Selection**: Choose PHP or Oracle developer track
2. **Skills Assessment**: Evaluate current skill levels
3. **Goal Setting**: Define career objectives and timeline
4. **AI Plan Generation**: GPT-4 powered roadmap creation
5. **Progress Tracking**: Monitor milestone completion
## 🎯 Development Roadmap

### Phase 1: Foundation ✅
- [x] Next.js 14 setup with TypeScript
- [x] Tailwind CSS styling
- [x] Basic component structure
- [x] Docker configuration
- [x] CI/CD pipeline

### Phase 2: Backend Integration ✅
- [x] Supabase authentication with JWT sessions
- [x] PostgreSQL database schema with RLS policies
- [x] API routes for authentication and chat
- [x] User session management
- [x] Database security and optimization

### Phase 3: AI Features ✅
- [x] OpenAI GPT-4 integration
- [x] Context-aware AI mentor chat system
- [x] Career framework integration (PHP/Oracle)
- [x] Personalized learning path generation
- [x] Multi-mode chat interactions

### Phase 4: Learning System ✅
- [x] Skills assessment and evaluation
- [x] Goal setting and timeline planning
- [x] Quarterly milestone tracking
- [x] Progress monitoring and analytics
- [x] Career progression frameworks

### Phase 5: Advanced Features 🚧
- [ ] Quiz generation system
- [ ] Project assessment tools
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Social learning features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 📚 Documentation

- **[Context and Memory System](CONTEXT_AND_MEMORY.md)** - Comprehensive guide to the AI mentor's context and memory management
- **[CSS Styling Guide](CSS_STYLING_GUIDE.md)** - Complete styling system documentation
- **[Learning Path Implementation](learning-path.md)** - Detailed implementation status and features
- **[Technical Implementation Handbook](Technical%20Implementation%20Handbook.docx.md)** - Complete technical documentation

## 🎯 Key Features in Detail

### AI Mentor Chat System
- **Context-Aware Responses**: AI remembers user's career path, progress, and preferences
- **Multi-Mode Interactions**: General guidance, code review, interview prep, and motivation
- **Career Framework Integration**: PHP and Oracle developer progression paths
- **Real-time Learning**: Adapts responses based on user's current learning phase

### Learning Path System
- **Personalized Roadmaps**: AI-generated career plans with quarterly milestones
- **Skills Assessment**: Comprehensive evaluation of current skill levels
- **Progress Tracking**: Real-time milestone completion monitoring
- **Goal Management**: Structured goal setting and timeline planning

### Authentication & Security
- **Supabase Integration**: Secure user authentication and session management
- **JWT Sessions**: Stateless authentication with HTTP-only cookies
- **RLS Policies**: Row-level security for database protection
- **Password Security**: Bcrypt hashing for secure password storage

---

**Note:** This is a production-ready AI mentor chat system with comprehensive career guidance features, secure authentication, and personalized learning experiences for PHP and Oracle developers.
