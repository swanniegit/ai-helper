'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  Crown,
  Zap,
  Star
} from 'lucide-react';

// Gamification Components
import XPProgressBar from '@/components/gamification/XPProgressBar';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import LeaderboardDisplay from '@/components/gamification/LeaderboardDisplay';
import GuildList from '@/components/gamification/GuildList';
import DailyChallengesList from '@/components/gamification/DailyChallengesList';
import SeasonalEventsList from '@/components/gamification/SeasonalEventsList';
import AchievementNotification from '@/components/gamification/AchievementNotification';

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
      {/* Header */}
      <div className="bg-card/10 backdrop-blur-sm rounded-lg border border-border/20 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              DevPath Chronicles
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Your gamified learning adventure - level up your skills!
            </p>
          </div>
          <div className="lg:max-w-md">
            <XPProgressBar />
          </div>
        </div>
      </div>

      {/* Gamification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-card/20 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="guilds" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Guilds</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Challenges</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Total XP
                </CardTitle>
                <CardDescription>Experience points earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">--</div>
                <p className="text-xs text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Achievements
                </CardTitle>
                <CardDescription>Badges collected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">--</div>
                <p className="text-xs text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Current Streak
                </CardTitle>
                <CardDescription>Days in a row</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">--</div>
                <p className="text-xs text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  Current Level
                </CardTitle>
                <CardDescription>Your developer rank</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">--</div>
                <p className="text-xs text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary-foreground">Recent Achievements</h3>
              <BadgeDisplay limit={8} show_progress={false} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary-foreground">Today&apos;s Challenges</h3>
              <DailyChallengesList compact={true} max_challenges={4} show_header={false} />
            </div>
          </div>

          {/* Active Seasonal Events */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary-foreground">Active Events</h3>
            <SeasonalEventsList compact={true} show_upcoming={false} max_events={2} />
          </div>
        </TabsContent>

        {/* Seasonal Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground">Seasonal Events</h2>
              <p className="text-primary-foreground/80">
                Join special events for bonus XP, exclusive rewards, and community challenges
              </p>
            </div>
          </div>
          <SeasonalEventsList show_upcoming={true} />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground">Achievement Badges</h2>
              <p className="text-primary-foreground/80">
                Collect badges by completing various learning activities
              </p>
            </div>
          </div>
          <BadgeDisplay show_progress={true} />
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground">Leaderboards</h2>
              <p className="text-primary-foreground/80">
                See how you rank against other developers (anonymously)
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-foreground">Weekly Rankings</h3>
              <LeaderboardDisplay 
                skill_category="General" 
                time_period="weekly" 
                limit={10}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-foreground">All-Time Champions</h3>
              <LeaderboardDisplay 
                skill_category="General" 
                time_period="all_time" 
                limit={10}
              />
            </div>
          </div>
        </TabsContent>

        {/* Guilds Tab */}
        <TabsContent value="guilds" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground">Developer Guilds</h2>
              <p className="text-primary-foreground/80">
                Join study squads, skill guilds, and mentor circles
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Users className="w-4 h-4 mr-2" />
              Create Guild
            </Button>
          </div>
          
          <GuildList 
            show_create_button={true}
            show_join_functionality={true}
            filter_type="all"
          />
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground">Daily Challenges</h2>
              <p className="text-primary-foreground/80">
                Complete daily challenges to earn XP and maintain your streak
              </p>
            </div>
            <Button variant="outline" className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Target className="w-4 h-4 mr-2" />
              Generate New Challenges
            </Button>
          </div>
          
          <DailyChallengesList />
        </TabsContent>
      </Tabs>

      {/* Achievement Notification Component (hidden by default, shows on achievements) */}
      <AchievementNotification />
    </div>
  );
}