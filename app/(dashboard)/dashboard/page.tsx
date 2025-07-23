import GoalCard from '@/components/GoalCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockGoals } from '@/lib/mockData';
import XPProgressBar from '@/components/gamification/XPProgressBar';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import LeaderboardDisplay from '@/components/gamification/LeaderboardDisplay';
import GuildList from '@/components/gamification/GuildList';
import DailyChallengesList from '@/components/gamification/DailyChallengesList';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
      {/* Header with XP Progress */}
      <div className="bg-card/10 backdrop-blur-sm rounded-lg border border-border/20 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-2">
              DevPath Chronicles Dashboard
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Your gamified learning adventure continues
            </p>
          </div>
          <div className="lg:max-w-md">
            <XPProgressBar compact={true} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active Goals</CardTitle>
            <CardDescription>Track your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{mockGoals.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Skills Learned</CardTitle>
            <CardDescription>This quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">12</div>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mentoring Hours</CardTitle>
            <CardDescription>AI interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">24h</div>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Completion Rate</CardTitle>
            <CardDescription>Overall progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">87%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Primary Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Learning Goals Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary-foreground">My Learning Goals</h2>
              <Button variant="outline" className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Add New Goal
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>

          {/* Daily Challenges Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary-foreground">Daily Challenges</h2>
            <DailyChallengesList compact={true} max_challenges={3} />
          </div>

          {/* Guilds Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary-foreground">My Guilds</h2>
              <Button variant="outline" className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Browse All Guilds
              </Button>
            </div>
            <GuildList 
              filter_type="user_guilds" 
              compact={true} 
              show_create_button={false}
              show_join_functionality={false}
            />
          </div>
        </div>

        {/* Right Column - Gamification Sidebar */}
        <div className="space-y-6">
          {/* Achievement Badges */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary-foreground">Recent Achievements</h3>
            <BadgeDisplay limit={6} show_progress={false} />
          </div>

          {/* Leaderboard Preview */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary-foreground">Leaderboard</h3>
            <LeaderboardDisplay 
              skill_category="General" 
              time_period="weekly" 
              limit={5} 
              compact={true}
            />
          </div>

          {/* Quick Stats Card */}
          <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
              <CardDescription>Your DevPath progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Level</span>
                <span className="font-bold text-primary">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <span className="font-bold text-primary">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Badges Earned</span>
                <span className="font-bold text-primary">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <span className="font-bold text-primary">-- days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}