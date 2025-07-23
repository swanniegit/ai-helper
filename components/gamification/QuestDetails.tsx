'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen,
  User,
  Target,
  Trophy,
  Clock,
  Star,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Play,
  MessageCircle,
  Sparkles,
  Crown,
  Users,
  Calendar,
  Scroll
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Quest {
  id: string;
  quest_key: string;
  title: string;
  description: string;
  narrative_text: string;
  quest_type: 'main_story' | 'side_quest' | 'daily' | 'special' | 'social';
  required_level: number;
  objectives: Array<{
    id: string;
    description: string;
    target_type: string;
    target_value: number;
    current_progress: number;
    is_completed: boolean;
  }>;
  xp_reward: number;
  quest_giver_name: string;
  quest_giver_avatar: string;
  estimated_duration_hours: number;
  difficulty_rating: number;
}

interface UserQuest {
  id: string;
  quest_id: string;
  status: 'available' | 'active' | 'completed';
  objectives_progress: Array<{
    objective_id: string;
    current_progress: number;
    target_value: number;
    completed_at?: string;
  }>;
  started_at?: string;
  completed_at?: string;
  quest: Quest;
}

interface QuestStep {
  id: string;
  step_key: string;
  step_name: string;
  step_description: string;
  step_narrative: string;
  step_order: number;
  is_optional: boolean;
  step_xp_reward: number;
}

interface QuestNPC {
  id: string;
  npc_key: string;
  npc_name: string;
  npc_title: string;
  npc_description: string;
  npc_personality: string;
  npc_avatar_emoji: string;
  npc_avatar_color: string;
}

interface QuestDetailsProps {
  quest: UserQuest | Quest;
  is_user_quest?: boolean;
  className?: string;
  on_back?: () => void;
  on_start_quest?: (questId: string) => void;
  on_talk_to_npc?: (npcId: string) => void;
}

export default function QuestDetails({ 
  quest, 
  is_user_quest = false,
  className,
  on_back,
  on_start_quest,
  on_talk_to_npc
}: QuestDetailsProps) {
  const [questDetails, setQuestDetails] = useState<{
    quest: Quest;
    steps: QuestStep[];
    npc: QuestNPC | null;
    dialogues: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const questData = is_user_quest ? (quest as UserQuest).quest : (quest as Quest);
  const userQuestData = is_user_quest ? (quest as UserQuest) : null;

  const fetchQuestDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quests/${questData.id}/details`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quest details');
      }

      const result = await response.json();
      if (result.success) {
        setQuestDetails(result.data);
      }
    } catch (err) {
      console.error('Quest details fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [questData.id]);

  useEffect(() => {
    fetchQuestDetails();
  }, [fetchQuestDetails]);

  const getQuestTypeIcon = (questType: string) => {
    switch (questType) {
      case 'main_story': return <BookOpen className="w-4 h-4" />;
      case 'side_quest': return <Scroll className="w-4 h-4" />;
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'special': return <Crown className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      default: return <Scroll className="w-4 h-4" />;
    }
  };

  const getQuestTypeColor = (questType: string) => {
    switch (questType) {
      case 'main_story': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'side_quest': return 'bg-green-100 text-green-800 border-green-200';
      case 'daily': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'special': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'social': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < difficulty ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  const calculateProgress = () => {
    if (!is_user_quest || !userQuestData) return 0;
    const totalObjectives = questData.objectives.length;
    const completedObjectives = userQuestData.objectives_progress.filter(
      obj => obj.current_progress >= obj.target_value
    ).length;
    return Math.round((completedObjectives / totalObjectives) * 100);
  };

  const getObjectiveProgress = (objectiveId: string) => {
    if (!is_user_quest || !userQuestData) return { current: 0, target: 0, completed: false };
    
    const objective = questData.objectives.find(obj => obj.id === objectiveId);
    const progress = userQuestData.objectives_progress.find(p => p.objective_id === objectiveId);
    
    return {
      current: progress?.current_progress || 0,
      target: objective?.target_value || 0,
      completed: (progress?.current_progress || 0) >= (objective?.target_value || 0)
    };
  };

  if (loading) {
    return (
      <Card className={cn("max-w-4xl mx-auto", className)}>
        <div className="animate-pulse p-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const progress = calculateProgress();

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start gap-4">
            {on_back && (
              <Button
                variant="ghost"
                size="sm"
                onClick={on_back}
                className="mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge 
                  variant="outline" 
                  className={cn("text-sm", getQuestTypeColor(questData.quest_type))}
                >
                  {getQuestTypeIcon(questData.quest_type)}
                  <span className="ml-2 capitalize">
                    {questData.quest_type.replace('_', ' ')}
                  </span>
                </Badge>
                
                <div className="flex items-center gap-1">
                  {getDifficultyStars(questData.difficulty_rating)}
                </div>
                
                {is_user_quest && userQuestData?.status === 'completed' && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-3xl mb-2">{questData.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {questData.description}
              </CardDescription>
              
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>{questData.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{questData.estimated_duration_hours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Level {questData.required_level}+ required</span>
                </div>
              </div>
            </div>
            
            <div className="text-center min-w-[80px]">
              <div className="text-4xl mb-2">{questData.quest_giver_avatar}</div>
              <div className="text-sm font-medium text-gray-700">
                {questData.quest_giver_name}
              </div>
              <div className="text-xs text-gray-500">Quest Giver</div>
            </div>
          </div>
          
          {/* Progress Bar for Active Quests */}
          {is_user_quest && userQuestData?.status === 'active' && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Quest Progress</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Quest Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Quest Story
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg border-l-4 border-l-primary">
            <p className="text-gray-700 leading-relaxed italic">
              &quot;{questData.narrative_text}&quot;
            </p>
          </div>
          
          {questDetails?.npc && (
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{questDetails.npc.npc_avatar_emoji}</div>
                <div>
                  <div className="font-medium">{questDetails.npc.npc_name}</div>
                  <div className="text-sm text-gray-600">{questDetails.npc.npc_title}</div>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => on_talk_to_npc?.(questDetails.npc!.id)}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Talk
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quest Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quest Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questData.objectives.map((objective, index) => {
              const objProgress = getObjectiveProgress(objective.id);
              return (
                <div
                  key={objective.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 transition-all",
                    objProgress.completed 
                      ? "border-green-200 bg-green-50" 
                      : "border-gray-200 bg-gray-50"
                  )}
                >
                  <div className="mt-1">
                    {objProgress.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium",
                        objProgress.completed ? "text-green-800" : "text-gray-700"
                      )}>
                        {objective.description}
                      </span>
                      
                      {is_user_quest && (
                        <span className="text-sm text-gray-600">
                          {objProgress.current} / {objProgress.target}
                        </span>
                      )}
                    </div>
                    
                    {is_user_quest && objProgress.target > 1 && (
                      <div className="mt-2">
                        <Progress 
                          value={(objProgress.current / objProgress.target) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quest Steps (if available) */}
      {questDetails?.steps && questDetails.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quest Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questDetails.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    {index < questDetails.steps.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{step.step_name}</h4>
                      {step.is_optional && (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{step.step_description}</p>
                    {step.step_narrative && (
                      <p className="text-sm text-gray-500 italic">&quot;{step.step_narrative}&quot;</p>
                    )}
                    {step.step_xp_reward > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Trophy className="w-3 h-3" />
                        <span>+{step.step_xp_reward} XP</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!is_user_quest && (
                <Button
                  size="lg"
                  onClick={() => on_start_quest?.(questData.id)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Begin Quest
                </Button>
              )}
              
              {is_user_quest && userQuestData?.status === 'active' && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Continue Quest
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4" />
              <span>Epic adventure awaits!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}