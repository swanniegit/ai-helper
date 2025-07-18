import GoalCard from '@/components/GoalCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockGoals } from '@/lib/mockData';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
      <div className="bg-card/10 backdrop-blur-sm rounded-lg border border-border/20 p-6 shadow-lg">
        <h1 className="text-4xl font-bold text-primary-foreground mb-2">
          AI Career Mentor Dashboard
        </h1>
        <p className="text-primary-foreground/80 text-lg">
          Your personalized learning journey starts here
        </p>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-foreground">My Learning Goals</h2>
          <Button variant="outline" className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Add New Goal
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
}