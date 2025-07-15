# Learning Path System Documentation

## Overview

The Learning Path System is a comprehensive AI-powered feature that helps users create personalized learning plans based on their skills, goals, and timeline. It follows a 4-step wizard process to generate actionable learning paths.

## Architecture

### Components

1. **LearningPathWizard** - Main orchestrator component
2. **SkillsAssessmentForm** - Step 1: Skills selection
3. **SkillLevelAssessment** - Step 2: Skill level evaluation
4. **GoalDiscussion** - Step 3: Career goals and priorities
5. **LearningPlanGeneration** - Step 4: AI-powered plan generation

### Database Schema

The system uses the following tables:
- `user_profiles` - Extended user information
- `skills_assessments` - User skills and levels
- `user_goals` - Career goals and timeline
- `learning_plans` - Generated learning plans
- `learning_plan_quarters` - Quarterly breakdowns
- `progress_tracking` - Milestone tracking
- `quiz_results` - Assessment results
- `learning_resources` - Available resources
- `user_resource_completions` - Resource completion tracking

## API Endpoints

### POST /api/generate-learning-path

Generates a personalized learning plan using OpenAI GPT-4.

**Request Body:**
```json
{
  "skills": ["JavaScript", "React", "Node.js"],
  "skillLevels": {
    "JavaScript": "intermediate",
    "React": "beginner",
    "Node.js": "beginner"
  },
  "careerGoals": ["Get promoted to Senior Developer", "Learn cloud technologies"],
  "timelineMonths": 12,
  "priorityAreas": ["Technical Skills", "Leadership"]
}
```

**Response:**
```json
{
  "summary": "A 12-month learning journey focused on...",
  "estimatedHours": 120,
  "quarters": [
    {
      "quarter": 1,
      "title": "Foundation Building",
      "objectives": ["Master React fundamentals", "Build portfolio projects"],
      "resources": ["React documentation", "Online courses"],
      "milestones": ["Complete React course", "Deploy 2 projects"],
      "estimatedHours": 30
    }
  ]
}
```

## User Flow

### Step 1: Skills Assessment
- Users select from 25+ common technical skills
- Can add custom skills
- Minimum 5 skills required to proceed

### Step 2: Skill Level Assessment
- Rate each skill as Beginner, Intermediate, or Advanced
- Clear descriptions and examples for each level
- Progress tracking through skills

### Step 3: Goal Discussion
- Select career goals from predefined options
- Set timeline (6-24 months)
- Choose priority areas for development

### Step 4: Plan Generation
- AI analyzes all inputs to create personalized plan
- Generates quarterly objectives, resources, and milestones
- Provides estimated time commitments

## Features

### AI-Powered Generation
- Uses OpenAI GPT-4 for intelligent plan creation
- Considers skill levels, goals, and timeline
- Generates practical, achievable objectives
- Provides specific learning resources

### Progress Tracking
- Track completion of milestones
- Update progress status
- Add notes and completion dates
- Visual progress indicators

### Resource Management
- Curated learning resources
- Different resource types (courses, books, articles)
- Difficulty level filtering
- User ratings and reviews

### Quarterly Planning
- Breaks down learning into manageable quarters
- Specific objectives for each quarter
- Measurable milestones
- Time estimates for planning

## Implementation Details

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Dependencies
- `@supabase/supabase-js` - Database operations
- `openai` - AI plan generation
- `react` - UI components
- `tailwindcss` - Styling

### Database Setup
Run the SQL schema in `database/schema.sql` to set up all required tables, indexes, and RLS policies.

## Usage Examples

### Creating a New Learning Path
```typescript
// Navigate to the learning path wizard
router.push('/learning-paths/new')

// The wizard will guide users through the 4-step process
// and automatically generate a personalized plan
```

### Accessing Generated Plans
```typescript
// Plans are stored in the database and can be accessed via Supabase
const { data: plans } = await supabase
  .from('learning_plans')
  .select('*')
  .eq('user_id', userId)
```

## Future Enhancements

1. **Adaptive Learning** - Adjust plans based on progress
2. **Peer Learning** - Connect with others on similar paths
3. **Certification Tracking** - Track professional certifications
4. **Mentor Integration** - Connect with mentors for guidance
5. **Job Market Alignment** - Align skills with market demands
6. **Mobile App** - Native mobile experience
7. **Offline Support** - Work without internet connection
8. **Analytics Dashboard** - Detailed progress analytics

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key configuration
   - Verify account has sufficient credits
   - Check rate limits

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure RLS policies are configured

3. **Plan Generation Failures**
   - Fallback plan will be generated
   - Check browser console for errors
   - Verify all required fields are provided

### Debug Mode
Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

## Contributing

When contributing to the Learning Path System:

1. Follow the existing component structure
2. Add TypeScript types for all new interfaces
3. Include error handling for API calls
4. Add tests for new functionality
5. Update documentation for any changes
6. Follow the established naming conventions

## Security Considerations

- All database operations use Row Level Security (RLS)
- User data is isolated by user_id
- API keys are stored securely in environment variables
- Input validation on all forms
- XSS protection through React's built-in escaping 