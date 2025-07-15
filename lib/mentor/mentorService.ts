import OpenAI from 'openai';
import { getCareerFramework, getAllSkillsForLevel } from '../careerFrameworks';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MentorContext {
  userId: string;
  careerPath?: 'PHP' | 'Oracle';
  currentLevel?: 'Junior' | 'Intermediate' | 'Senior';
  targetLevel?: 'Junior' | 'Intermediate' | 'Senior';
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
  }>;
  careerGoals: string[];
  learningProgress: {
    completedMilestones: number;
    totalMilestones: number;
    currentQuarter: number;
  };
  recentActivity: string[];
}

export interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    skillMentioned?: string;
    goalRelated?: boolean;
    progressUpdate?: boolean;
  };
}

export interface MentorResponse {
  message: string;
  suggestions: string[];
  motivation: string;
  nextSteps: string[];
  skillFocus?: string;
  confidence: number; // 0-100
}

export class MentorService {
  private static readonly SYSTEM_PROMPT = `You are an experienced career mentor specializing in PHP and Oracle development. You provide personalized, encouraging guidance to help developers advance their careers.

Your role:
- Give specific, actionable advice based on the user's career path and current skills
- Provide motivation and encouragement
- Suggest relevant learning resources and next steps
- Help with code review and technical questions
- Prepare users for interviews and career transitions
- Track progress and celebrate achievements

Always be supportive, specific, and actionable. Reference the user's career framework and current progress when giving advice.`;

  /**
   * Generate a contextual mentor response
   */
  static async generateResponse(
    userMessage: string,
    context: MentorContext,
    conversationHistory: MentorMessage[] = []
  ): Promise<MentorResponse> {
    try {
      // Build context-aware prompt
      const contextPrompt = this.buildContextPrompt(context);
      const conversationPrompt = this.buildConversationPrompt(conversationHistory);
      
      const fullPrompt = `${this.SYSTEM_PROMPT}

${contextPrompt}

${conversationPrompt}

User: ${userMessage}

Please respond as a supportive mentor with:
1. A helpful, encouraging message
2. 2-3 specific suggestions for next steps
3. A motivational statement
4. Recommended focus areas
5. Confidence level (0-100) in your advice

Format your response as JSON:
{
  "message": "Your main response",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "motivation": "Motivational message",
  "nextSteps": ["step1", "step2", "step3"],
  "skillFocus": "primary skill to focus on",
  "confidence": 85
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = completion.choices[0].message?.content;
      
      if (!content) {
        throw new Error('No response from mentor AI');
      }

      // Try to parse JSON response
      try {
        const response = JSON.parse(content);
        return {
          message: response.message || 'I understand your question. Let me help you with that.',
          suggestions: response.suggestions || [],
          motivation: response.motivation || 'Keep up the great work!',
          nextSteps: response.nextSteps || [],
          skillFocus: response.skillFocus,
          confidence: response.confidence || 75
        };
      } catch (parseError) {
        // Fallback response if JSON parsing fails
        return {
          message: content,
          suggestions: ['Continue with your current learning path', 'Practice the skills you\'re learning'],
          motivation: 'You\'re making great progress!',
          nextSteps: ['Review your current quarter objectives', 'Complete the next milestone'],
          confidence: 70
        };
      }
    } catch (error) {
      console.error('Mentor response generation error:', error);
      return {
        message: 'I\'m here to help you on your career journey! What would you like to know about your learning path?',
        suggestions: ['Review your current learning objectives', 'Focus on your target skills'],
        motivation: 'Every step forward is progress toward your goals!',
        nextSteps: ['Continue with your current quarter plan', 'Practice your core skills'],
        confidence: 60
      };
    }
  }

  /**
   * Generate code review feedback
   */
  static async reviewCode(
    code: string,
    language: 'PHP' | 'SQL' | 'PL/SQL',
    context: MentorContext
  ): Promise<{
    feedback: string;
    suggestions: string[];
    score: number; // 0-100
    improvements: string[];
  }> {
    try {
      const prompt = `You are an expert ${language} developer reviewing code for a ${context.careerPath} developer at ${context.currentLevel} level.

Code to review:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Constructive feedback on the code
2. Specific suggestions for improvement
3. A score out of 100
4. List of improvements to make

Consider the developer's current level and career path when giving feedback.

Format as JSON:
{
  "feedback": "Overall assessment",
  "suggestions": ["suggestion1", "suggestion2"],
  "score": 85,
  "improvements": ["improvement1", "improvement2"]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      });

      const content = completion.choices[0].message?.content;
      
      if (!content) {
        throw new Error('No code review response');
      }

      try {
        const response = JSON.parse(content);
        return {
          feedback: response.feedback || 'Good effort! Here are some suggestions.',
          suggestions: response.suggestions || [],
          score: response.score || 70,
          improvements: response.improvements || []
        };
      } catch (parseError) {
        return {
          feedback: content,
          suggestions: ['Review the code structure', 'Check for best practices'],
          score: 70,
          improvements: ['Improve code organization', 'Add comments']
        };
      }
    } catch (error) {
      console.error('Code review error:', error);
      return {
        feedback: 'I\'d be happy to review your code! Please try again.',
        suggestions: ['Make sure the code is complete', 'Check for syntax errors'],
        score: 50,
        improvements: ['Complete the implementation', 'Add error handling']
      };
    }
  }

  /**
   * Generate interview preparation questions
   */
  static async generateInterviewQuestions(
    context: MentorContext,
    questionType: 'technical' | 'behavioral' | 'mixed' = 'mixed'
  ): Promise<{
    questions: Array<{
      question: string;
      type: 'technical' | 'behavioral';
      difficulty: 'easy' | 'medium' | 'hard';
      expectedAnswer: string;
      tips: string[];
    }>;
    preparationTips: string[];
  }> {
    try {
      const prompt = `Generate interview questions for a ${context.careerPath} developer at ${context.currentLevel} level targeting ${context.targetLevel} level.

Question type: ${questionType}
Career path: ${context.careerPath}
Current skills: ${context.skills.map(s => `${s.name} (${s.level})`).join(', ')}

Generate 5 questions with:
- Question text
- Type (technical/behavioral)
- Difficulty level
- Expected answer
- Tips for answering

Also provide 3 general preparation tips.

Format as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "technical",
      "difficulty": "medium",
      "expectedAnswer": "Expected answer",
      "tips": ["tip1", "tip2"]
    }
  ],
  "preparationTips": ["tip1", "tip2", "tip3"]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1200,
      });

      const content = completion.choices[0].message?.content;
      
      if (!content) {
        throw new Error('No interview questions generated');
      }

      try {
        const response = JSON.parse(content);
        return {
          questions: response.questions || [],
          preparationTips: response.preparationTips || []
        };
      } catch (parseError) {
        return {
          questions: [],
          preparationTips: ['Practice your technical skills', 'Prepare your career story', 'Research the company']
        };
      }
    } catch (error) {
      console.error('Interview questions generation error:', error);
      return {
        questions: [],
        preparationTips: ['Review your technical skills', 'Practice common questions', 'Prepare your portfolio']
      };
    }
  }

  /**
   * Generate daily motivation message
   */
  static async generateDailyMotivation(context: MentorContext): Promise<{
    message: string;
    focusArea: string;
    challenge: string;
    encouragement: string;
  }> {
    try {
      const progressPercentage = Math.round((context.learningProgress.completedMilestones / context.learningProgress.totalMilestones) * 100);
      
      const prompt = `Generate a daily motivation message for a ${context.careerPath} developer.

Context:
- Current level: ${context.currentLevel}
- Target level: ${context.targetLevel}
- Progress: ${progressPercentage}% complete
- Current quarter: ${context.learningProgress.currentQuarter}
- Recent activity: ${context.recentActivity.join(', ')}

Provide:
1. An encouraging daily message
2. A specific focus area for today
3. A small challenge to tackle
4. Words of encouragement

Format as JSON:
{
  "message": "Daily motivation message",
  "focusArea": "Today's focus",
  "challenge": "Today's challenge",
  "encouragement": "Encouraging words"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 500,
      });

      const content = completion.choices[0].message?.content;
      
      if (!content) {
        throw new Error('No motivation message generated');
      }

      try {
        const response = JSON.parse(content);
        return {
          message: response.message || 'You\'re doing great! Keep pushing forward.',
          focusArea: response.focusArea || 'Core skills development',
          challenge: response.challenge || 'Practice one new concept today',
          encouragement: response.encouragement || 'Every expert was once a beginner.'
        };
      } catch (parseError) {
        return {
          message: content,
          focusArea: 'Skill development',
          challenge: 'Learn something new today',
          encouragement: 'You\'ve got this!'
        };
      }
    } catch (error) {
      console.error('Motivation generation error:', error);
      return {
        message: 'Good morning! Ready to make progress on your career goals?',
        focusArea: 'Your current learning objectives',
        challenge: 'Complete one milestone today',
        encouragement: 'You\'re building an amazing future!'
      };
    }
  }

  private static buildContextPrompt(context: MentorContext): string {
    const framework = context.careerPath ? getCareerFramework(context.careerPath) : null;
    const currentSkills = context.currentLevel && framework ? getAllSkillsForLevel(framework, context.currentLevel) : [];
    const targetSkills = context.targetLevel && framework ? getAllSkillsForLevel(framework, context.targetLevel) : [];

    return `User Context:
- Career Path: ${context.careerPath || 'Not specified'}
- Current Level: ${context.currentLevel || 'Not specified'}
- Target Level: ${context.targetLevel || 'Not specified'}
- Skills: ${context.skills.map(s => `${s.name} (${s.level})`).join(', ')}
- Career Goals: ${context.careerGoals.join(', ')}
- Progress: ${context.learningProgress.completedMilestones}/${context.learningProgress.totalMilestones} milestones completed
- Current Quarter: ${context.learningProgress.currentQuarter}
- Recent Activity: ${context.recentActivity.join(', ')}

Current Level Skills: ${currentSkills.map(s => s.name).join(', ')}
Target Level Skills: ${targetSkills.map(s => s.name).join(', ')}`;
  }

  private static buildConversationPrompt(history: MentorMessage[]): string {
    if (history.length === 0) return '';
    
    const recentMessages = history.slice(-6); // Last 6 messages
    return `Recent Conversation:
${recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;
  }
} 