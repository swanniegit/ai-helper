# Vercel Deployment Guide

## Prerequisites

### 1. **Dependencies Check** ✅
All required dependencies are properly configured:

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-slot": "^1.2.3",
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.51.0",
    "@tanstack/react-table": "^8.21.3",
    "bcryptjs": "^3.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.525.0",
    "next": "14.2.3",
    "openai": "^4.25.0",
    "postgres": "^3.4.7",
    "react": "^18",
    "react-dom": "^18",
    "tailwind-merge": "^2.2.1",
    "uuid": "^11.1.0"
  }
}
```

### 2. **Node.js Version**
- **Required**: Node.js 18.17.0 or higher
- **Recommended**: Node.js 20.x (matches Vercel functions runtime)

### 3. **Framework Configuration**
- ✅ Next.js 14.2.3 (fully supported)
- ✅ App Router architecture
- ✅ TypeScript support
- ✅ Tailwind CSS integration
- ✅ Shadcn/ui components

## Deployment Steps

### 1. **Environment Variables Setup**

⚠️ **CRITICAL**: Set these environment variables in your Vercel dashboard before deployment:

```bash
# Required for the application to work
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_TELEMETRY_DISABLED=1
CUSTOM_KEY=your-custom-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**How to set environment variables in Vercel:**
1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the correct value
5. Make sure to set them for **Production**, **Preview**, and **Development**

### 2. **Build Configuration**

The project includes:
- ✅ `vercel.json` configuration file
- ✅ Optimized Next.js config (standalone output disabled for Vercel)
- ✅ Proper TypeScript configuration
- ✅ PostCSS and Tailwind CSS setup

### 3. **Database Setup**

**Supabase Configuration:**
1. Create a Supabase project
2. Run the database schema from `database/schema.sql`
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers

**Database Tables Required:**
- `users` - User accounts and profiles
- `user_sessions` - JWT session management
- `skills_assessments` - User skills and levels
- `user_goals` - Career goals and timelines
- `learning_plans` - Generated learning plans
- `learning_plan_quarters` - Quarterly plan breakdowns
- `progress_tracking` - Milestone completion tracking
- `quiz_results` - Assessment results
- `conversation_history` - Chat message storage

### 4. **Vercel Deployment Commands**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Or deploy directly from GitHub
# Connect your GitHub repository in Vercel dashboard
```

## Vercel-Specific Optimizations

### 1. **Function Configuration**
- ✅ API routes optimized for Vercel Functions
- ✅ Node.js 20.x runtime
- ✅ Proper timeout handling
- ✅ Edge-compatible where applicable

### 2. **Image Optimization**
- ✅ Next.js Image component ready
- ✅ Vercel Image Optimization enabled
- ✅ No external image domains required

### 3. **Performance**
- ✅ Static generation where possible
- ✅ Server-side rendering for dynamic content
- ✅ Optimized bundle size with tree-shaking
- ✅ Shadcn/ui components are build-optimized

## Security Headers

Security headers are configured in both `next.config.mjs` and `vercel.json`:
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: origin-when-cross-origin
- ✅ Content-Security-Policy configured

## Build Process

### 1. **Automatic Checks**
```bash
# These commands must pass for successful deployment
npm run build        # ✅ Builds successfully
npm run type-check   # ✅ TypeScript types valid
npm run lint         # ✅ ESLint passes
```

### 2. **Build Output**
- ✅ Static assets optimized
- ✅ API routes compiled
- ✅ Server components ready
- ✅ CSS compiled and minified

## Potential Issues & Solutions

### 1. **Environment Variables**
**Issue**: Missing required environment variables
**Solution**: Ensure all variables from `.env.example` are set in Vercel dashboard

### 2. **Database Connection**
**Issue**: Supabase connection failures
**Solution**: 
- Verify Supabase URL and anon key
- Check RLS policies
- Ensure database schema is applied

### 3. **OpenAI API**
**Issue**: OpenAI API key not working
**Solution**: 
- Verify API key is valid
- Check rate limits
- Ensure sufficient credits

### 4. **Build Failures**
**Issue**: Build process fails
**Solution**: 
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies are installed

## Recommended Vercel Settings

### 1. **Project Settings**
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 2. **Function Settings**
- **Runtime**: Node.js 20.x
- **Memory**: 1024 MB (for AI operations)
- **Timeout**: 30 seconds (for OpenAI API calls)

### 3. **Domain Settings**
- Configure custom domain if needed
- Set up SSL certificates (automatic with Vercel)

## Monitoring & Analytics

### 1. **Vercel Analytics**
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user interactions

### 2. **Error Tracking**
- Enable error boundaries in React components
- Monitor API route errors
- Set up logging for debugging

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection working
- [ ] OpenAI API integration functional
- [ ] User authentication working
- [ ] All pages load correctly
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable
- [ ] Security headers present
- [ ] SSL certificate active

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review build output for errors
3. Verify environment variables
4. Test database connectivity
5. Check API integrations

The application is fully optimized for Vercel deployment with modern Next.js 14 features and the new Shadcn/ui design system!