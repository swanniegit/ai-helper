import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type GoalStatus = 'On Track' | 'Behind' | 'At Risk' | 'Completed';
export interface Goal {
  id: string;
  description: string;
  progress_pct: number;
  status: GoalStatus;
  expected_progress: number;
}

interface GoalCardProps {
  goal: Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const statusMap: Record<GoalStatus, { color: string; gradient: string; bgColor: string }> = {
    'On Track': { 
      color: 'text-primary bg-primary/20 border-primary/30', 
      gradient: 'from-primary to-primary/80',
      bgColor: 'bg-primary/10'
    },
    Behind: { 
      color: 'text-primary/80 bg-primary/15 border-primary/25', 
      gradient: 'from-primary/80 to-primary/60',
      bgColor: 'bg-primary/5'
    },
    'At Risk': { 
      color: 'text-destructive bg-destructive/20 border-destructive/30', 
      gradient: 'from-destructive to-destructive/80',
      bgColor: 'bg-destructive/10'
    },
    Completed: { 
      color: 'text-primary bg-primary/30 border-primary/40', 
      gradient: 'from-primary to-gray-700',
      bgColor: 'bg-primary/20'
    },
  };

  const { color, gradient, bgColor } = statusMap[goal.status];

  return (
    <Card className={cn(
      "bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-all duration-300 animate-fadeIn",
      bgColor
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-card-foreground">{goal.description}</CardTitle>
        <CardDescription>
          <span className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
            color
          )}>
            {goal.status}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{goal.progress_pct}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r',
                gradient
              )}
              style={{ width: `${goal.progress_pct}%` }}
            />
          </div>
          {goal.status !== 'Completed' && (
            <div className="text-xs text-muted-foreground">
              Expected: {goal.expected_progress}%
            </div>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoalCard;