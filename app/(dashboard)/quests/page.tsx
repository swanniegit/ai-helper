'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Scroll,
  BookOpen,
  MessageCircle,
  ArrowLeft,
  Crown,
  Sparkles
} from 'lucide-react';

// Quest Components
import QuestLog from '@/components/gamification/QuestLog';
import QuestDetails from '@/components/gamification/QuestDetails';
import DialogueInterface from '@/components/gamification/DialogueInterface';

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

type ViewMode = 'log' | 'details' | 'dialogue';

export default function QuestsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('log');
  const [selectedQuest, setSelectedQuest] = useState<UserQuest | Quest | null>(null);
  const [selectedNPC, setSelectedNPC] = useState<any>(null);
  const [dialogueContext, setDialogueContext] = useState<string>('general_advice');
  const [questNPCs, setQuestNPCs] = useState<QuestNPC[]>([]);

  useEffect(() => {
    fetchQuestNPCs();
  }, []);

  const fetchQuestNPCs = async () => {
    try {
      const response = await fetch('/api/quests', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.npcs) {
          setQuestNPCs(result.data.npcs);
        }
      }
    } catch (err) {
      console.error('Failed to fetch quest NPCs:', err);
    }
  };

  const handleQuestSelect = (quest: UserQuest) => {
    setSelectedQuest(quest);
    setViewMode('details');
  };

  const handleStartQuest = async (questId: string) => {
    try {
      const response = await fetch('/api/quests/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quest_id: questId })
      });

      if (response.ok) {
        // Return to quest log to show updated quest status
        setViewMode('log');
        setSelectedQuest(null);
      }
    } catch (err) {
      console.error('Failed to start quest:', err);
    }
  };

  const handleTalkToNPC = (npcId: string, context: string = 'general_advice') => {
    const npc = questNPCs.find(n => n.id === npcId);
    if (npc) {
      // Ensure the NPC has all required fields for DialogueInterface
      const dialogueNPC = {
        ...npc,
        specializes_in: (npc as any).specializes_in || ['general'],
        quest_types: (npc as any).quest_types || ['main_story']
      };
      setSelectedNPC(dialogueNPC);
      setDialogueContext(context);
      setViewMode('dialogue');
    }
  };

  const handleBackToLog = () => {
    setViewMode('log');
    setSelectedQuest(null);
    setSelectedNPC(null);
  };

  const handleDialogueComplete = () => {
    if (selectedQuest) {
      setViewMode('details');
    } else {
      setViewMode('log');
    }
    setSelectedNPC(null);
  };

  return (
    <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
      {/* Header */}
      <div className="bg-card/10 backdrop-blur-sm rounded-lg border border-border/20 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
              <Scroll className="w-8 h-8 text-primary" />
              Quest Chronicles
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Embark on epic adventures and master your development skills through engaging storylines
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {viewMode !== 'log' && (
              <Button
                onClick={handleBackToLog}
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quest Log
              </Button>
            )}
            
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="font-medium">Epic Stories Await!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Based on View Mode */}
      <div className="space-y-6">
        {viewMode === 'log' && (
          <QuestLog
            on_quest_select={handleQuestSelect}
            show_completed={true}
            className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg"
          />
        )}

        {viewMode === 'details' && selectedQuest && (
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20 p-6 shadow-lg">
            <QuestDetails
              quest={selectedQuest}
              is_user_quest={'status' in selectedQuest}
              on_back={handleBackToLog}
              on_start_quest={handleStartQuest}
              on_talk_to_npc={(npcId) => handleTalkToNPC(npcId, 'quest_start')}
            />
          </div>
        )}

        {viewMode === 'dialogue' && selectedNPC && (
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20 p-6 shadow-lg">
            <DialogueInterface
              npc={selectedNPC}
              context_type={dialogueContext}
              on_close={handleDialogueComplete}
              on_dialogue_complete={handleDialogueComplete}
            />
          </div>
        )}
      </div>

      {/* Quest Features Overview */}
      {viewMode === 'log' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Epic Storylines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Immerse yourself in rich narratives that make learning programming concepts feel like an epic adventure.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Interactive NPCs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Meet unique characters like Master Syntaxis, Elena Webwright, and Darius Datakeeper who guide your journey.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="w-5 h-5 text-purple-600" />
                Progressive Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Earn XP, unlock achievements, and receive special rewards as you complete quests and master new skills.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}