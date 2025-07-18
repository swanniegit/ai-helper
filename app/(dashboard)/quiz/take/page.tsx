'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QuizQuestion, QuizSession } from '../../../../types/quiz';
import QuizQuestionComponent from '../../../../components/quiz/QuizQuestionComponent';
import QuizTimer from '../../../../components/quiz/QuizTimer';
import QuizProgress from '../../../../components/quiz/QuizProgress';
import QuizResults from '../../../../components/quiz/QuizResults';

function TakeQuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionToken = searchParams.get('session');
  
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<any>(null);
  
  const startTime = useRef<number>(Date.now());

  const loadQuizSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz/session?token=${sessionToken}`);
      const data = await response.json();

      if (data.success) {
        setQuizSession(data.data);
        setTimeRemaining(data.data.template.time_limit_minutes * 60);
        setAnswers(new Array(data.data.questions.length).fill(''));
      } else {
        setError(data.error || 'Failed to load quiz session');
      }
    } catch (err) {
      setError('Failed to load quiz session');
      console.error('Load quiz session error:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  const handleSubmitQuiz = useCallback(async () => {
    if (!quizSession) return;

    try {
      const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
      
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: sessionToken,
          answers: answers,
          time_taken_seconds: timeTaken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQuizResults(data.data);
        setIsComplete(true);
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      setError('Failed to submit quiz');
      console.error('Submit quiz error:', err);
    }
  }, [quizSession, sessionToken, answers]);

  useEffect(() => {
    if (!sessionToken) {
      setError('No quiz session found');
      setLoading(false);
      return;
    }

    loadQuizSession();
  }, [sessionToken, loadQuizSession]);

  useEffect(() => {
    if (timeRemaining <= 0 && !isComplete) {
      handleSubmitQuiz();
    }
  }, [timeRemaining, isComplete, handleSubmitQuiz]);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quizSession?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleRetakeQuiz = () => {
    router.push('/quiz');
  };

  const handleContinue = () => {
    router.push('/quiz');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/quiz')}
            className="px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg hover:from-primary/90 hover:to-gray-700/90"
          >
            Back to Quiz Center
          </button>
        </div>
      </div>
    );
  }

  if (isComplete && quizResults) {
    return (
      <QuizResults
        result={quizResults.result}
        feedback={quizResults.feedback}
        onRetake={handleRetakeQuiz}
        onContinue={handleContinue}
      />
    );
  }

  if (!quizSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Quiz session not found</p>
          <button
            onClick={() => router.push('/quiz')}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg hover:from-primary/90 hover:to-gray-700/90"
          >
            Back to Quiz Center
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizSession.questions[currentQuestionIndex];
  const totalQuestions = quizSession.questions.length;
  const answeredQuestions = answers.filter(answer => answer !== '').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {quizSession.template?.name || 'Quiz'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <QuizTimer
                timeRemaining={timeRemaining}
                setTimeRemaining={setTimeRemaining}
                onTimeUp={handleSubmitQuiz}
              />
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Quiz Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <QuizQuestionComponent
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                onAnswer={handleAnswerSelect}
                selectedAnswer={answers[currentQuestionIndex]}
                timeRemaining={timeRemaining}
              />

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex items-center space-x-2">
                  {currentQuestionIndex === totalQuestions - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg hover:from-primary/90 hover:to-gray-700/90 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <QuizProgress
              totalQuestions={totalQuestions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              onQuestionJump={handleQuestionJump}
              answeredCount={answeredQuestions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TakeQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    }>
      <TakeQuizContent />
    </Suspense>
  );
} 