'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileButton, FloatingActionButton, MobileActionButton } from '@/components/ui/mobile-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Home, 
  Trophy,
  Zap,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileQuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  skill_tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
}

interface MobileQuizInterfaceProps {
  questions: MobileQuizQuestion[];
  onComplete: (answers: string[], score: number) => void;
  skillCategory: string;
  timeLimit?: number;
}

export default function MobileQuizInterface({
  questions,
  onComplete,
  skillCategory,
  timeLimit = 900 // 15 minutes default
}: MobileQuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(new Array(questions.length).fill(''));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isPaused || isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isSubmitted, timeRemaining]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = selectedAnswers.filter(answer => answer !== '').length;

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correct_answer ? 1 : 0);
    }, 0);
    
    setIsSubmitted(true);
    setShowResults(true);
    onComplete(selectedAnswers, score);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeColor = () => {
    if (timeRemaining > timeLimit * 0.5) return 'text-green-600';
    if (timeRemaining > timeLimit * 0.25) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Results View
  if (showResults) {
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correct_answer ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen-safe bg-gradient-metro p-4 pb-safe-bottom">
        <div className="max-w-md mx-auto space-y-6">
          {/* Results Header */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center animate-bounceIn">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                Quiz Complete!
              </CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {percentage}%
                </div>
                <div className="text-muted-foreground">
                  {score} out of {questions.length} correct
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Performance Breakdown */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
                  <div className="text-xs text-muted-foreground">Wrong</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{formatTime(timeLimit - timeRemaining)}</div>
                  <div className="text-xs text-muted-foreground">Time Used</div>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Performance</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <MobileActionButton 
              onClick={() => window.location.href = '/quiz'}
              className="bg-gradient-to-r from-primary to-primary/90"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Take Another Quiz
            </MobileActionButton>
            
            <MobileActionButton 
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Dashboard
            </MobileActionButton>
          </div>

          {/* XP Reward (if gamification is enabled) */}
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">XP Earned</span>
              </div>
              <div className="text-2xl font-bold">{score * 10} XP</div>
              <div className="text-sm opacity-90">Keep up the great work!</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-safe bg-gradient-metro p-4 pb-safe-bottom">
      <div className="max-w-md mx-auto space-y-4">
        {/* Quiz Header */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-primary">{skillCategory}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getDifficultyColor(currentQuestion.difficulty_level)}>
                    {currentQuestion.difficulty_level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={cn("text-lg font-bold", getTimeColor())}>
                  <Clock className="inline h-4 w-4 mr-1" />
                  {formatTime(timeRemaining)}
                </div>
                <MobileButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  className="text-xs"
                >
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </MobileButton>
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{answeredCount} answered</span>
              <span>{questions.length - answeredCount} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="bg-white shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg leading-relaxed text-gray-800">
              {currentQuestion.question_text}
            </CardTitle>
            <div className="flex flex-wrap gap-1 mt-2">
              {currentQuestion.skill_tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 pb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === option;
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              
              return (
                <MobileButton
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="full"
                  touchSize="large"
                  onClick={() => handleAnswerSelect(option)}
                  className={cn(
                    "text-left justify-start p-4 h-auto min-h-[60px] transition-all duration-200",
                    isSelected && "ring-2 ring-primary/50 shadow-lg"
                  )}
                >
                  <div className="flex items-start gap-3 text-left">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      isSelected ? "bg-white text-primary" : "bg-primary/20 text-primary"
                    )}>
                      {letter}
                    </div>
                    <span className="flex-1 leading-relaxed">{option}</span>
                    {isSelected && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
                  </div>
                </MobileButton>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex gap-3">
          <MobileButton
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </MobileButton>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <MobileButton
              onClick={handleSubmitQuiz}
              disabled={answeredCount === 0}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
            >
              Submit Quiz
              <CheckCircle className="h-4 w-4 ml-2" />
            </MobileButton>
          ) : (
            <MobileButton
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
              className="flex-1"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </MobileButton>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const isAnswered = selectedAnswers[index] !== '';
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <MobileButton
                    key={index}
                    variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                    size="icon"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={cn(
                      "h-10 w-10 text-sm",
                      isCurrent && "ring-2 ring-primary/50"
                    )}
                  >
                    {index + 1}
                  </MobileButton>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Submit Button (when quiz is complete) */}
      {answeredCount === questions.length && !isSubmitted && (
        <FloatingActionButton onClick={handleSubmitQuiz}>
          <CheckCircle className="h-8 w-8" />
        </FloatingActionButton>
      )}
    </div>
  );
}