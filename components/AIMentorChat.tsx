'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Code, MessageSquare, Zap, Bot, User, Star, Lightbulb, TrendingUp } from 'lucide-react';

interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    skillMentioned?: string;
    goalRelated?: boolean;
    progressUpdate?: boolean;
  };
}

interface MentorResponse {
  message: string;
  suggestions: string[];
  motivation: string;
  nextSteps: string[];
  skillFocus?: string;
  confidence: number;
}

interface CodeReview {
  feedback: string;
  suggestions: string[];
  score: number;
  improvements: string[];
}



interface DailyMotivation {
  message: string;
  focusArea: string;
  challenge: string;
  encouragement: string;
}

type ChatMode = 'chat' | 'code-review' | 'daily-motivation';

export default function AIMentorChat() {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('chat');
  const [userContext, setUserContext] = useState<any>(null);
  const [codeReview, setCodeReview] = useState<CodeReview | null>(null);
  const [dailyMotivation, setDailyMotivation] = useState<DailyMotivation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your AI Career Mentor. I'm here to help you advance your career in PHP or Oracle development. What would you like to work on today?",
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const sendMessage = async (message: string, action: string = 'chat') => {
    if (!message.trim()) return;

    const userMessage: MentorMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          action
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (action === 'chat') {
          const assistantMessage: MentorMessage = {
            role: 'assistant',
            content: data.response.message,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setUserContext(data.context);
        } else if (action === 'code-review') {
          setCodeReview(data.review);
        } else if (action === 'daily-motivation') {
          setDailyMotivation(data.motivation);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: MentorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage, chatMode);
  };



  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-green-50 via-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-700 to-gray-700 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Career Mentor</h2>
              <p className="text-sm text-gray-600">Your personalized career guide</p>
            </div>
          </div>
          
          {userContext && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {userContext.careerPath} Developer
              </p>
              <p className="text-xs text-gray-600">
                {userContext.currentLevel} → {userContext.targetLevel}
              </p>
              <p className="text-xs text-primary">
                Progress: {userContext.progress}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setChatMode('chat')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              chatMode === 'chat'
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
          
          <button
            onClick={() => setChatMode('code-review')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              chatMode === 'code-review'
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Code Review</span>
          </button>
          

          <button
            onClick={() => setChatMode('daily-motivation')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              chatMode === 'daily-motivation'
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Daily Motivation</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMode === 'chat' && (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-gray-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <User className="w-5 h-5 text-white/80 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Code Review Results */}
        {chatMode === 'code-review' && codeReview && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Code Review Results</h3>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">Score: {codeReview.score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-gray-700 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${codeReview.score}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{codeReview.feedback}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {codeReview.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Improvements</h4>
                <ul className="space-y-1">
                  {codeReview.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}



        {/* Daily Motivation */}
        {chatMode === 'daily-motivation' && dailyMotivation && (
          <div className="bg-gradient-to-r from-primary to-gray-700 rounded-lg p-6 text-white">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Daily Motivation</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-lg font-medium">{dailyMotivation.message}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Today&apos;s Focus</h4>
                  <p className="text-sm">{dailyMotivation.focusArea}</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Challenge</h4>
                  <p className="text-sm">{dailyMotivation.challenge}</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Encouragement</h4>
                  <p className="text-sm">{dailyMotivation.encouragement}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            {chatMode === 'code-review' ? (
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Paste your code here with language specification (e.g., ```php\n// your code\n```)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
                disabled={isLoading}
              />
            ) : (
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  chatMode === 'chat' ? "Ask me anything about your career development..." :
                  chatMode === 'daily-motivation' ? "Type 'motivate' for daily inspiration..." :
                  "Type your message..."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg hover:from-primary/90 hover:to-gray-700/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {chatMode === 'chat' && (
            <>
              <button
                onClick={() => sendMessage("What should I focus on next in my learning path?", 'chat')}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Next Steps
              </button>
              <button
                onClick={() => sendMessage("How am I progressing compared to others?", 'chat')}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Progress Check
              </button>
              <button
                onClick={() => sendMessage("What skills should I prioritize?", 'chat')}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Skill Priority
              </button>
            </>
          )}
          
          {chatMode === 'code-review' && (
            <button
              onClick={() => sendMessage("```php\n<?php\nfunction calculateSum($a, $b) {\n    return $a + $b;\n}\n```", 'code-review')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Sample Code
            </button>
          )}
          

          
          {chatMode === 'daily-motivation' && (
            <button
              onClick={() => sendMessage("motivate", 'daily-motivation')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Get Motivated
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 