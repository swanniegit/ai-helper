# Role-Based AI Platform Demo

A Next.js 14 application demonstrating a role-based AI growth and goal-tracking platform with modern UI/UX design, Docker support, and CI/CD pipeline.

## 🚀 Features

- **Goal Tracking Dashboard** - Visual progress tracking with status indicators
- **AI Mentor Chat** - Interactive chat interface with simulated AI responses
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Modern Animations** - Smooth transitions and hover effects
- **TypeScript** - Full type safety throughout the application
- **Docker Support** - Containerized development and production deployment
- **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - Latest React features
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
role-based-ai-platform-demo/
├── app/                    # Next.js 14 app directory
│   ├── chat/              # AI chat functionality
│   ├── dashboard/         # Goal tracking dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ChatWindow.tsx     # Chat interface
│   ├── GoalCard.tsx       # Goal display component
│   └── NewsTicker.tsx     # News ticker component
├── lib/                   # Utility functions
│   └── mockData.ts        # Mock data for demo
├── types/                 # TypeScript type definitions
│   └── chat.ts           # Chat-related types
├── .github/              # GitHub Actions workflows
├── Dockerfile            # Production Docker image
├── Dockerfile.dev        # Development Docker image
├── docker-compose.yml    # Docker Compose configuration
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

Create a `.env.local` file for local development. You can start by copying
the provided `.env.example` file:

```bash
cp .env.example .env.local
```

Then adjust the values as needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_TELEMETRY_DISABLED=1
CUSTOM_KEY=your-custom-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Authentication (Preview)

Use Supabase credentials to sign in at `/login`. Successful login redirects to
the dashboard. Visit `/logout` to sign out.

## 🎯 Development Roadmap

### Phase 1: Foundation ✅
- [x] Next.js 14 setup with TypeScript
- [x] Tailwind CSS styling
- [x] Basic component structure
- [x] Docker configuration
- [x] CI/CD pipeline

### Phase 2: Backend Integration 🚧
- [ ] Supabase authentication
- [ ] Database schema implementation
- [ ] API routes for goals and chat
- [ ] Real-time features

### Phase 3: AI Features 🚧
- [ ] OpenAI API integration
- [ ] RAG system implementation
- [ ] Role-based responses
- [ ] Document processing

### Phase 4: Advanced Features 🚧
- [ ] Quiz engine
- [ ] CBT support
- [ ] Analytics dashboard
- [ ] Mobile app

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

---

**Note:** This is a demo application showcasing the frontend foundation for a comprehensive role-based AI platform. The full system will include backend services, AI integration, and advanced features as outlined in the Technical Implementation Handbook.
