'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle,
  X,
  User,
  Crown,
  Sparkles,
  Heart,
  ArrowRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestNPC {
  id: string;
  npc_key: string;
  npc_name: string;
  npc_title: string;
  npc_description: string;
  npc_personality: string;
  npc_avatar_emoji: string;
  npc_avatar_color: string;
  specializes_in: string[];
  quest_types: string[];
}

interface Dialogue {
  id: string;
  dialogue_key: string;
  dialogue_title: string;
  dialogue_text: string;
  dialogue_emotion: 'happy' | 'encouraging' | 'serious' | 'proud' | 'concerned' | 'excited' | 'mysterious';
  context_type: 'quest_start' | 'quest_progress' | 'quest_complete' | 'general_advice' | 'skill_encouragement';
  player_response_options?: Array<{
    option: string;
    response: string;
  }>;
}

interface DialogueInterfaceProps {
  npc: QuestNPC;
  context_type?: string;
  className?: string;
  on_close?: () => void;
  on_dialogue_complete?: (dialogue: Dialogue) => void;
}

export default function DialogueInterface({
  npc,
  context_type = 'general_advice',
  className,
  on_close,
  on_dialogue_complete
}: DialogueInterfaceProps) {
  const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    fetchDialogue();
  }, [npc.id, context_type]);

  const fetchDialogue = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quests/dialogue/${npc.id}?context=${context_type}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dialogue');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setCurrentDialogue(result.data);
      }
    } catch (err) {
      console.error('Dialogue fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSelect = (option: { option: string; response: string }) => {
    setSelectedResponse(option.option);
    setResponseText(option.response);
    setShowResponse(true);
    
    // Auto-hide response after 3 seconds
    setTimeout(() => {
      setShowResponse(false);
      setSelectedResponse(null);
      setResponseText('');
    }, 3000);
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'encouraging': return 'text-green-600 bg-green-50 border-green-200';
      case 'serious': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'proud': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'concerned': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'excited': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'mysterious': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'encouraging': return '💪';
      case 'serious': return '🤔';
      case 'proud': return '😌';
      case 'concerned': return '😟';
      case 'excited': return '🤩';
      case 'mysterious': return '🤫';
      default: return '😐';
    }
  };

  const getPersonalityStyle = (personality: string) => {
    switch (personality) {
      case 'wise': return 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200';
      case 'encouraging': return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'serious': return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
      case 'happy': return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
      case 'mysterious': return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
      default: return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={cn("max-w-2xl mx-auto", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentDialogue) {
    return (
      <Card className={cn("max-w-2xl mx-auto", className)}>
        <CardContent className="p-6 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No dialogue available</p>
          {on_close && (
            <Button onClick={on_close} variant="outline" className="mt-4">
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <Card className={cn(
        "border-2 shadow-xl",
        getPersonalityStyle(npc.npc_personality)
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4",
                  `bg-${npc.npc_avatar_color}-100 border-${npc.npc_avatar_color}-200`
                )}>
                  {npc.npc_avatar_emoji}
                </div>
                
                {/* Emotion indicator */}
                <div className="absolute -bottom-1 -right-1 text-lg">
                  {getEmotionIcon(currentDialogue.dialogue_emotion)}
                </div>
              </div>
              
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {npc.npc_name}
                  {npc.specializes_in.includes('leadership') && (
                    <Crown className="w-4 h-4 text-yellow-600" />
                  )}
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  {npc.npc_title}
                </CardDescription>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs capitalize", getEmotionColor(currentDialogue.dialogue_emotion))}
                  >
                    {currentDialogue.dialogue_emotion}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs capitalize">
                    {npc.npc_personality}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-gray-500 hover:text-gray-700"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              {on_close && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={on_close}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Dialogue Title */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {currentDialogue.dialogue_title}
            </h3>
          </div>
          
          {/* Main Dialogue */}
          <div className="mb-6">
            <div className={cn(
              "p-4 rounded-lg border-2 relative",
              getPersonalityStyle(npc.npc_personality)
            )}>
              {/* Speech bubble tail */}
              <div className={cn(
                "absolute -left-2 top-4 w-0 h-0 border-t-8 border-b-8 border-r-8",
                "border-t-transparent border-b-transparent",
                `border-r-${npc.npc_avatar_color}-200`
              )}></div>
              
              <p className="text-gray-800 leading-relaxed italic text-lg">
                &quot;{currentDialogue.dialogue_text}&quot;
              </p>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-3 h-3" />
                  <span className="capitalize">{currentDialogue.context_type.replace('_', ' ')}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Player Response Options */}
          {currentDialogue.player_response_options && !showResponse && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Response:
              </h4>
              
              {currentDialogue.player_response_options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4 hover:bg-primary/5 hover:border-primary"
                  onClick={() => handleResponseSelect(option)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <span>{option.option}</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                  </div>
                </Button>
              ))}
            </div>
          )}
          
          {/* NPC Response to Player Choice */}
          {showResponse && responseText && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="italic">&quot;{selectedResponse}&quot;</span>
              </div>
              
              <div className={cn(
                "p-3 rounded-lg border-2 bg-gradient-to-r from-primary/5 to-transparent border-primary/20"
              )}>
                <div className="flex items-start gap-3">
                  <div className="text-lg">{npc.npc_avatar_emoji}</div>
                  <p className="text-gray-700 italic">
                    &quot;{responseText}&quot;
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Relationship: Friendly</span>
            </div>
            
            <div className="flex items-center gap-2">
              {on_dialogue_complete && (
                <Button
                  onClick={() => on_dialogue_complete(currentDialogue)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continue Quest
                </Button>
              )}
              
              {on_close && (
                <Button variant="outline" onClick={on_close}>
                  End Conversation
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}