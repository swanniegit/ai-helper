'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scroll, 
  Crown, 
  Sword, 
  Users, 
  Star, 
  Calendar,
  Clock,
  Trophy,
  ChevronRight,
  Play,
  CheckCircle,
  BookOpen,
  Sparkles
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

interface QuestLogProps {
  className?: string;
  on_quest_select?: (quest: UserQuest) => void;
  show_completed?: boolean;
}

export default function QuestLog({ 
  className, 
  on_quest_select,
  show_completed = true 
}: QuestLogProps) {
  const [questData, setQuestData] = useState<{
    available_quests: Quest[];
    active_quests: UserQuest[];
    completed_quests: UserQuest[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'available' | 'active' | 'completed'>('active');

  useEffect(() => {
    fetchQuestData();
  }, []);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quests', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quest data');
      }

      const result = await response.json();
      if (result.success) {
        setQuestData(result.data);
      }
    } catch (err) {
      console.error('Quest fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuest = async (questId: string) => {
    try {
      const response = await fetch('/api/quests/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quest_id: questId })
      });

      if (!response.ok) {
        throw new Error('Failed to start quest');
      }

      // Refresh quest data
      await fetchQuestData();
    } catch (err) {
      console.error('Start quest error:', err);
    }
  };

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
          "w-3 h-3",
          i < difficulty ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  const calculateProgress = (userQuest: UserQuest) => {
    const totalObjectives = userQuest.quest.objectives.length;
    const completedObjectives = userQuest.objectives_progress.filter(
      obj => obj.current_progress >= obj.target_value
    ).length;
    return Math.round((completedObjectives / totalObjectives) * 100);
  };

  const renderQuestCard = (quest: Quest | UserQuest, isUserQuest = false) => {
    const questData = isUserQuest ? (quest as UserQuest).quest : (quest as Quest);
    const progress = isUserQuest ? calculateProgress(quest as UserQuest) : 0;
    const userQuestData = isUserQuest ? (quest as UserQuest) : null;

    return (
      <Card 
        key={questData.id}
        className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary/30"
        onClick={() => on_quest_select?.(quest as UserQuest)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getQuestTypeColor(questData.quest_type))}
                >
                  {getQuestTypeIcon(questData.quest_type)}
                  <span className="ml-1 capitalize">
                    {questData.quest_type.replace('_', ' ')}
                  </span>
                </Badge>
                <div className="flex items-center gap-1">
                  {getDifficultyStars(questData.difficulty_rating)}
                </div>
              </div>
              
              <CardTitle className="text-lg leading-tight">{questData.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {questData.description}
              </CardDescription>
            </div>
            
            <div className="text-center min-w-[60px]">
              <div className="text-2xl mb-1">{questData.quest_giver_avatar}</div>
              <div className="text-xs text-gray-600 font-medium">
                {questData.quest_giver_name}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Quest Objectives Preview */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Objectives:</div>
            <div className="space-y-1">
              {questData.objectives.slice(0, 2).map((objective, index) => (
                <div key={objective.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle 
                    className={cn(
                      "w-3 h-3",
                      userQuestData?.objectives_progress?.find(p => p.objective_id === objective.id)?.current_progress >= objective.target_value
                        ? "text-green-600" 
                        : "text-gray-300"
                    )} 
                  />
                  <span className="text-gray-600">{objective.description}</span>
                </div>
              ))}
              {questData.objectives.length > 2 && (
                <div className="text-xs text-gray-500 italic">
                  +{questData.objectives.length - 2} more objectives
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar for Active Quests */}
          {isUserQuest && userQuestData?.status === 'active' && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Quest Rewards and Info */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                <span>{questData.xp_reward} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{questData.estimated_duration_hours}h</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isUserQuest && (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    startQuest(questData.id);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              )}
              
              {userQuestData?.status === 'completed' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
              
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scroll className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-2xl">Quest Log</CardTitle>
              <CardDescription>
                Your adventure awaits - track and manage your quests
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">
              Epic stories await!
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-gray-100 rounded-lg">
          <Button
            variant={selectedTab === 'available' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('available')}
            className="flex-1"
          >
            Available ({questData?.available_quests?.length || 0})
          </Button>
          <Button
            variant={selectedTab === 'active' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('active')}
            className="flex-1"
          >
            Active ({questData?.active_quests?.length || 0})
          </Button>
          {show_completed && (
            <Button
              variant={selectedTab === 'completed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('completed')}
              className="flex-1"
            >
              Completed ({questData?.completed_quests?.length || 0})
            </Button>
          )}
        </div>

        {/* Quest Lists */}
        <div className="space-y-4">
          {selectedTab === 'available' && (
            <div className="space-y-4">
              {questData?.available_quests?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No quests available</p>
                  <p className="text-sm">Complete current quests to unlock new adventures!</p>
                </div>
              ) : (
                questData?.available_quests?.map(quest => renderQuestCard(quest, false))
              )}
            </div>
          )}

          {selectedTab === 'active' && (
            <div className="space-y-4">
              {questData?.active_quests?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sword className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No active quests</p>
                  <p className="text-sm">Start a quest to begin your adventure!</p>
                </div>
              ) : (
                questData?.active_quests?.map(quest => renderQuestCard(quest, true))
              )}
            </div>
          )}

          {selectedTab === 'completed' && show_completed && (
            <div className="space-y-4">
              {questData?.completed_quests?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No completed quests</p>
                  <p className="text-sm">Complete quests to see your achievements here!</p>
                </div>
              ) : (
                questData?.completed_quests?.map(quest => renderQuestCard(quest, true))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}