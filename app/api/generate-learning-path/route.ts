import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCareerFramework, getAllSkillsForLevel, getTrainingResources } from '../../../lib/careerFrameworks';

// Force dynamic rendering for this route (uses OpenAI API)
export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface LearningPathRequest {
  skills: string[]
  skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>
  careerGoals: string[]
  timelineMonths: number
  priorityAreas: string[]
  careerPath?: 'PHP' | 'Oracle'
  currentLevel?: 'Junior' | 'Intermediate' | 'Senior'
  targetLevel?: 'Junior' | 'Intermediate' | 'Senior'
}

interface Quarter {
  quarter: number
  title: string
  objectives: string[]
  resources: string[]
  milestones: string[]
  estimatedHours: number
}

interface GeneratedPlan {
  quarters: Quarter[]
  summary: string
  estimatedHours: number
}

export async function POST(req: Request) {
  try {
    const { 
      skills, 
      skillLevels, 
      careerGoals, 
      timelineMonths, 
      priorityAreas,
      careerPath,
      currentLevel,
      targetLevel 
    }: LearningPathRequest = await req.json();

    // Get career framework data if career path is specified
    let frameworkData = '';
    let frameworkSkills = '';
    let trainingResources = '';
    
    if (careerPath && (careerPath === 'PHP' || careerPath === 'Oracle')) {
      const framework = getCareerFramework(careerPath);
      if (framework) {
        frameworkData = `
Career Framework: ${careerPath} Developer
`;

        // Add current level skills if specified
        if (currentLevel) {
          const currentSkills = getAllSkillsForLevel(framework, currentLevel);
          frameworkSkills += `
Current Level (${currentLevel}) Skills:
${currentSkills.map(skill => `- ${skill.name}: ${skill.description}`).join('\n')}
`;
        }

        // Add target level skills if specified
        if (targetLevel) {
          const targetSkills = getAllSkillsForLevel(framework, targetLevel);
          frameworkSkills += `
Target Level (${targetLevel}) Skills:
${targetSkills.map(skill => `- ${skill.name}: ${skill.description}`).join('\n')}
`;

          // Add training resources for the first skill in target level
          if (targetSkills.length > 0) {
            const resources = getTrainingResources(targetSkills[0].name, targetLevel);
            if (resources) {
              trainingResources = `
Recommended Training Resources for ${targetLevel} Level (${targetSkills[0].name}):
${resources.courses ? `Courses: ${resources.courses.join(', ')}` : ''}
${resources.books ? `Books: ${resources.books.join(', ')}` : ''}
${resources.practice ? `Practice: ${resources.practice.join(', ')}` : ''}
`;
            }
          }
        }
      }
    }

    const prompt = `Create a comprehensive learning plan for a technical professional with the following details:

Skills and Levels:
${skills.map(skill => `- ${skill}: ${skillLevels[skill]}`).join('\n')}

Career Goals:
${careerGoals.map(goal => `- ${goal}`).join('\n')}

Timeline: ${timelineMonths} months
Priority Areas: ${priorityAreas.join(', ')}

${frameworkData}

${frameworkSkills}

${trainingResources}

Please create a detailed learning plan with the following structure:
1. A summary paragraph explaining the overall approach
2. ${Math.ceil(timelineMonths / 3)} quarters, each with:
   - A descriptive title
   - 3-4 specific objectives
   - 3-4 learning resources (courses, books, projects)
   - 2-3 measurable milestones
   - Estimated hours per quarter

Format the response as JSON with this exact structure:
{
  "summary": "Overall plan description",
  "estimatedHours": total_hours,
  "quarters": [
    {
      "quarter": 1,
      "title": "Quarter title",
      "objectives": ["objective1", "objective2"],
      "resources": ["resource1", "resource2"],
      "milestones": ["milestone1", "milestone2"],
      "estimatedHours": hours_for_quarter
    }
  ]
}

Make the plan practical, achievable, and tailored to the individual's current skill levels and career goals. If a career framework is provided, ensure the plan aligns with the specific skills and progression path outlined in the framework.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let plan: GeneratedPlan;
    try {
      plan = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback plan
      console.warn('Failed to parse OpenAI response as JSON, using fallback plan');
      plan = createFallbackPlan(skills, careerGoals, timelineMonths);
    }

    // Validate the plan structure
    if (!plan.quarters || !Array.isArray(plan.quarters)) {
      plan = createFallbackPlan(skills, careerGoals, timelineMonths);
    }

    return NextResponse.json(plan);
  } catch (err: any) {
    console.error('Learning path generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate learning path.' },
      { status: 500 }
    );
  }
}

function createFallbackPlan(
  skills: string[], 
  careerGoals: string[], 
  timelineMonths: number
): GeneratedPlan {
  const quarters = Math.ceil(timelineMonths / 3);
  const planQuarters: Quarter[] = [];

  for (let i = 1; i <= quarters; i++) {
    planQuarters.push({
      quarter: i,
      title: `Quarter ${i}: Foundation Building`,
      objectives: [
        `Master core concepts in ${skills.slice(0, 2).join(' and ')}`,
        `Complete 2-3 practical projects`,
        `Build a portfolio showcasing your skills`
      ],
      resources: [
        'Online courses from platforms like Coursera or Udemy',
        'Official documentation and tutorials',
        'Practice projects and coding challenges'
      ],
      milestones: [
        `Complete ${skills.length} skill assessments`,
        'Build and deploy 2 portfolio projects',
        'Achieve 80%+ on practice assessments'
      ],
      estimatedHours: Math.round(120 / quarters)
    });
  }

  return {
    summary: `A ${timelineMonths}-month learning journey focused on ${skills.join(', ')} to achieve your career goals: ${careerGoals.slice(0, 2).join(' and ')}. This plan is structured in ${quarters} quarters with practical, hands-on learning experiences.`,
    estimatedHours: 120,
    quarters: planQuarters
  };
}
