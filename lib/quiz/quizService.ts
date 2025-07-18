import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import {
  QuizTemplate,
  QuizQuestion,
  QuizSession,
  QuizResult,
  QuizFeedback,
  QuizAnalytics,
  UserQuizPreferences,
  GenerateQuizRequest,
  SubmitQuizRequest,
  DifficultyLevel,
  QuizType,
  QuestionType
} from '../../types/quiz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key'
});

export class QuizService {
  /**
   * Generate a new quiz session
   */
  static async generateQuiz(request: GenerateQuizRequest, userId: string): Promise<{
    session_token: string;
    template: QuizTemplate;
    questions: QuizQuestion[];
    time_limit_minutes: number;
    total_questions: number;
  }> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Determine difficulty level
      const difficulty = request.difficulty_level || preferences?.preferred_difficulty || 'intermediate';
      const questionCount = request.question_count || preferences?.preferred_question_count || 15;
      
      // Get quiz template - with fallback if none found
      let template = await this.getQuizTemplate(request.skill_category, difficulty, request.quiz_type);
      if (!template) {
        console.log(`No database template found for ${request.skill_category} at ${difficulty} level, creating fallback`);
        template = this.createFallbackTemplate(request.skill_category, difficulty, request.quiz_type);
      }
      
      // Get questions for the template
      let questions = await this.getQuestionsForTemplate(template.id, questionCount);
      
      // If not enough questions, generate AI questions
      if (questions.length < questionCount) {
        const aiQuestions = await this.generateAIQuestions(
          request.skill_category,
          difficulty,
          questionCount - questions.length,
          userId
        );
        questions = [...questions, ...aiQuestions];
      }
      
      // Shuffle questions
      questions = this.shuffleArray(questions);
      
      // Create quiz session
      const sessionToken = uuidv4();
      const session: QuizSession = {
        id: uuidv4(),
        user_id: userId,
        template_id: template.id,
        session_token: sessionToken,
        questions,
        current_question_index: 0,
        answers: [],
        start_time: new Date().toISOString(),
        is_active: true,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      };
      
      // Save session to database
      await supabase
        .from('quiz_sessions')
        .insert({
          id: session.id,
          user_id: session.user_id,
          template_id: session.template_id,
          session_token: session.session_token,
          questions: session.questions,
          current_question_index: session.current_question_index,
          answers: session.answers,
          start_time: session.start_time,
          is_active: session.is_active,
          expires_at: session.expires_at
        });
      
      return {
        session_token: sessionToken,
        template,
        questions,
        time_limit_minutes: template.time_limit_minutes,
        total_questions: questions.length
      };
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw new Error('Failed to generate quiz');
    }
  }
  
  /**
   * Submit quiz answers and get results
   */
  static async submitQuiz(request: SubmitQuizRequest, userId: string): Promise<{
    result: QuizResult;
    feedback: QuizFeedback;
    analytics: QuizAnalytics[];
  }> {
    try {
      // Get quiz session
      const session = await this.getQuizSession(request.session_token, userId);
      if (!session) {
        throw new Error('Invalid or expired quiz session');
      }
      
      // Validate answers
      if (request.answers.length !== session.questions.length) {
        throw new Error('Number of answers does not match number of questions');
      }
      
      // Calculate score
      const correctAnswers = session.questions.map(q => q.correct_answer);
      const score = this.calculateScore(request.answers, correctAnswers);
      const percentageScore = (score / session.questions.length) * 100;
      const passed = percentageScore >= 70; // Default passing score
      
      // Generate feedback
      const feedback = await this.generateFeedback(
        session.questions,
        request.answers,
        correctAnswers,
        percentageScore,
        userId
      );
      
      // Create quiz result
      const result: QuizResult = {
        id: uuidv4(),
        user_id: userId,
        template_id: session.template_id,
        quiz_type: 'practice',
        questions: session.questions,
        user_answers: request.answers,
        correct_answers: correctAnswers,
        score,
        total_questions: session.questions.length,
        percentage_score: percentageScore,
        time_taken_seconds: request.time_taken_seconds,
        difficulty_level: session.questions[0]?.difficulty_level || 'intermediate',
        skill_category: session.questions[0]?.skill_tags[0] || 'General',
        passed,
        feedback,
        taken_at: new Date().toISOString()
      };
      
      // Save result to database
      await supabase
        .from('quiz_results')
        .insert({
          id: result.id,
          user_id: result.user_id,
          template_id: result.template_id,
          quiz_type: result.quiz_type,
          questions: result.questions,
          user_answers: result.user_answers,
          correct_answers: result.correct_answers,
          score: result.score,
          total_questions: result.total_questions,
          percentage_score: result.percentage_score,
          time_taken_seconds: result.time_taken_seconds,
          difficulty_level: result.difficulty_level,
          skill_category: result.skill_category,
          passed: result.passed,
          feedback: result.feedback,
          taken_at: result.taken_at
        });
      
      // Create analytics
      const analytics = await this.createAnalytics(result, request.time_taken_seconds);
      
      // Update session as completed
      await supabase
        .from('quiz_sessions')
        .update({
          end_time: new Date().toISOString(),
          is_active: false,
          answers: request.answers
        })
        .eq('session_token', request.session_token);
      
      return { result, feedback, analytics };
    } catch (error) {
      console.error('Quiz submission error:', error);
      throw new Error('Failed to submit quiz');
    }
  }
  
  /**
   * Get user's quiz progress and statistics
   */
  static async getUserProgress(userId: string): Promise<{
    completed_quizzes: number;
    average_score: number;
    total_time_spent: number;
    skills_mastered: string[];
    skills_needing_improvement: string[];
    weak_areas: string[];
    last_quiz_date: string;
    recent_performance: {
      date: string;
      score: number;
      quiz_name: string;
    }[];
  }> {
    try {
      const { data: results, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false });
      
      if (error) throw error;
      
      if (!results || results.length === 0) {
        return {
          completed_quizzes: 0,
          average_score: 0,
          total_time_spent: 0,
          skills_mastered: [],
          skills_needing_improvement: [],
          weak_areas: [],
          last_quiz_date: new Date().toISOString(),
          recent_performance: []
        };
      }
      
      const completedQuizzes = results.length;
      const averageScore = results.reduce((sum, r) => sum + r.percentage_score, 0) / completedQuizzes;
      const totalTimeSpent = results.reduce((sum, r) => sum + (r.time_taken_seconds || 0), 0);
      
      // Analyze skills
      const skillScores: { [key: string]: number[] } = {};
      results.forEach(result => {
        result.questions.forEach((question: QuizQuestion) => {
          question.skill_tags.forEach(skill => {
            if (!skillScores[skill]) skillScores[skill] = [];
            skillScores[skill].push(result.percentage_score);
          });
        });
      });
      
      const skillsMastered = Object.entries(skillScores)
        .filter(([_, scores]) => scores.reduce((sum, s) => sum + s, 0) / scores.length >= 80)
        .map(([skill]) => skill);
      
      const skillsNeedingImprovement = Object.entries(skillScores)
        .filter(([_, scores]) => scores.reduce((sum, s) => sum + s, 0) / scores.length < 60)
        .map(([skill]) => skill);
      
      const recentPerformance = results.slice(0, 5).map(result => ({
        date: result.taken_at,
        score: result.percentage_score,
        quiz_name: result.skill_category
      }));
      
      return {
        completed_quizzes: completedQuizzes,
        average_score: averageScore,
        total_time_spent: totalTimeSpent,
        skills_mastered: skillsMastered,
        skills_needing_improvement: skillsNeedingImprovement,
        weak_areas: skillsNeedingImprovement,
        last_quiz_date: results[0]?.taken_at || new Date().toISOString(),
        recent_performance: recentPerformance
      };
    } catch (error) {
      console.error('Get user progress error:', error);
      throw new Error('Failed to get user progress');
    }
  }
  
  /**
   * Get available quiz templates
   */
  static async getQuizTemplates(skillCategory?: string): Promise<QuizTemplate[]> {
    try {
      let query = supabase
        .from('quiz_templates')
        .select('*')
        .eq('is_active', true);
      
      if (skillCategory) {
        query = query.eq('skill_category', skillCategory);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // If no templates found, return fallback templates
      if (!data || data.length === 0) {
        return this.createFallbackTemplates(skillCategory);
      }
      
      return data;
    } catch (error) {
      console.error('Get quiz templates error:', error);
      // Return fallback templates on error
      return this.createFallbackTemplates(skillCategory);
    }
  }
  
  private static createFallbackTemplates(skillCategory?: string): QuizTemplate[] {
    const categories = skillCategory ? [skillCategory] : [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 
      'API Development', 'DevOps', 'Docker', 'AWS', 'Git', 'Testing'
    ];
    
    const templates: QuizTemplate[] = [];
    
    categories.forEach(category => {
      ['beginner', 'intermediate', 'advanced'].forEach(difficulty => {
        templates.push({
          id: uuidv4(),
          name: `${category} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
          description: `Test your knowledge of ${category} at ${difficulty} level`,
          quiz_type: 'practice',
          skill_category: category,
          difficulty_level: difficulty as DifficultyLevel,
          question_count: 10,
          time_limit_minutes: 15,
          passing_score: 70,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });
    });
    
    return templates;
  }
  
  /**
   * Get user quiz preferences
   */
  static async getUserPreferences(userId: string): Promise<UserQuizPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_quiz_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      return data;
    } catch (error) {
      console.error('Get user preferences error:', error);
      return null;
    }
  }
  
  /**
   * Update user quiz preferences
   */
  static async updateUserPreferences(userId: string, preferences: Partial<UserQuizPreferences>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_quiz_preferences')
        .upsert({
          user_id: userId,
          ...preferences
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Update user preferences error:', error);
      throw new Error('Failed to update preferences');
    }
  }
  
  // Private helper methods
  
  private static async getQuizTemplate(
    skillCategory: string,
    difficulty: DifficultyLevel,
    quizType?: QuizType
  ): Promise<QuizTemplate | null> {
    try {
      let query = supabase
        .from('quiz_templates')
        .select('*')
        .eq('skill_category', skillCategory)
        .eq('difficulty_level', difficulty)
        .eq('is_active', true);
      
      if (quizType) {
        query = query.eq('quiz_type', quizType);
      }
      
      const { data, error } = await query.limit(1).single();
      
      if (error && error.code === 'PGRST116') {
        // No template found, return null (fallback handled in calling method)
        console.log(`No database template found for ${skillCategory} at ${difficulty} level`);
        return null;
      }
      
      if (error) {
        console.error('Database error in getQuizTemplate:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Get quiz template error:', error);
      return null;
    }
  }
  
  private static createFallbackTemplate(
    skillCategory: string,
    difficulty: DifficultyLevel,
    quizType?: QuizType
  ): QuizTemplate {
    console.log(`Creating fallback template for ${skillCategory} at ${difficulty} level`);
    const template = {
      id: uuidv4(),
      name: `${skillCategory} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
      description: `Test your knowledge of ${skillCategory} at ${difficulty} level`,
      quiz_type: quizType || 'practice',
      skill_category: skillCategory,
      difficulty_level: difficulty,
      question_count: 10,
      time_limit_minutes: 15,
      passing_score: 70,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    console.log('Fallback template created:', template);
    return template;
  }
  
  private static async getQuestionsForTemplate(templateId: string, count: number): Promise<QuizQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('template_id', templateId)
        .eq('is_active', true)
        .limit(count);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Get questions error:', error);
      return [];
    }
  }
  
  private static async generateAIQuestions(
    skillCategory: string,
    difficulty: DifficultyLevel,
    count: number,
    userId: string
  ): Promise<QuizQuestion[]> {
    try {
      const prompt = `Generate ${count} multiple choice questions for ${skillCategory} at ${difficulty} level. 
      
      Format each question as JSON with this structure:
      {
        "question_text": "The question text",
        "options": ["option1", "option2", "option3", "option4"],
        "correct_answer": "The correct option",
        "explanation": "Why this answer is correct",
        "skill_tags": ["skill1", "skill2"]
      }
      
      Return an array of ${count} question objects. Make questions practical and relevant to real-world scenarios.`;
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      const content = completion.choices[0].message?.content;
      if (!content) throw new Error('No response from OpenAI');
      
      const questions = JSON.parse(content);
      return questions.map((q: any) => ({
        id: uuidv4(),
        template_id: '',
        question_text: q.question_text,
        question_type: 'multiple_choice' as QuestionType,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty_level: difficulty,
        skill_tags: q.skill_tags,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('AI question generation error:', error);
      return [];
    }
  }
  
  private static async getQuizSession(sessionToken: string, userId: string): Promise<QuizSession | null> {
    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Get quiz session error:', error);
      return null;
    }
  }
  
  private static calculateScore(userAnswers: string[], correctAnswers: string[]): number {
    return userAnswers.reduce((score, answer, index) => {
      return score + (answer === correctAnswers[index] ? 1 : 0);
    }, 0);
  }
  
  private static async generateFeedback(
    questions: QuizQuestion[],
    userAnswers: string[],
    correctAnswers: string[],
    percentageScore: number,
    userId: string
  ): Promise<QuizFeedback> {
    try {
      // Analyze performance
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const skillGaps: string[] = [];
      
      questions.forEach((question, index) => {
        const isCorrect = userAnswers[index] === correctAnswers[index];
        if (isCorrect) {
          strengths.push(question.skill_tags[0]);
        } else {
          weaknesses.push(question.skill_tags[0]);
          skillGaps.push(...question.skill_tags);
        }
      });
      
      // Determine overall performance
      let overallPerformance: 'excellent' | 'good' | 'fair' | 'needs_improvement';
      if (percentageScore >= 90) overallPerformance = 'excellent';
      else if (percentageScore >= 75) overallPerformance = 'good';
      else if (percentageScore >= 60) overallPerformance = 'fair';
      else overallPerformance = 'needs_improvement';
      
      // Generate recommendations using AI
      const prompt = `Based on a quiz score of ${percentageScore}% with strengths in ${strengths.join(', ')} and weaknesses in ${weaknesses.join(', ')}, provide:
      1. 3 specific recommendations for improvement
      2. Next steps for learning
      3. Estimated time to improve these skills
      
      Format as JSON:
      {
        "recommendations": ["rec1", "rec2", "rec3"],
        "next_steps": ["step1", "step2"],
        "estimated_improvement_time": "2-3 weeks"
      }`;
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      const content = completion.choices[0].message?.content;
      const aiFeedback = content ? JSON.parse(content) : {
        recommendations: ['Review the concepts you struggled with', 'Practice with similar questions', 'Seek additional resources'],
        next_steps: ['Complete practice exercises', 'Review course materials'],
        estimated_improvement_time: '1-2 weeks'
      };
      
      return {
        overall_performance: overallPerformance,
        strengths: [...new Set(strengths)],
        weaknesses: [...new Set(weaknesses)],
        recommendations: aiFeedback.recommendations,
        next_steps: aiFeedback.next_steps,
        skill_gaps: [...new Set(skillGaps)],
        estimated_improvement_time: aiFeedback.estimated_improvement_time
      };
    } catch (error) {
      console.error('Generate feedback error:', error);
      return {
        overall_performance: 'fair',
        strengths: [],
        weaknesses: [],
        recommendations: ['Review the concepts you struggled with'],
        next_steps: ['Complete practice exercises'],
        skill_gaps: [],
        estimated_improvement_time: '1-2 weeks'
      };
    }
  }
  
  private static async createAnalytics(result: QuizResult, totalTimeSpent: number): Promise<QuizAnalytics[]> {
    try {
      const analytics: QuizAnalytics[] = [];
      const timePerQuestion = Math.floor(totalTimeSpent / result.questions.length);
      
      for (let i = 0; i < result.questions.length; i++) {
        const question = result.questions[i];
        const userAnswer = result.user_answers[i];
        const isCorrect = userAnswer === result.correct_answers[i];
        
        analytics.push({
          id: uuidv4(),
          user_id: result.user_id,
          quiz_result_id: result.id,
          question_id: question.id,
          user_answer: userAnswer,
          is_correct: isCorrect,
          time_spent_seconds: timePerQuestion,
          difficulty_level: question.difficulty_level,
          skill_tag: question.skill_tags[0],
          created_at: new Date().toISOString()
        });
      }
      
      // Save analytics to database
      await supabase
        .from('quiz_analytics')
        .insert(analytics);
      
      return analytics;
    } catch (error) {
      console.error('Create analytics error:', error);
      return [];
    }
  }
  
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 