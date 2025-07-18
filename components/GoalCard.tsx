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
      color: 'text-green-700 bg-green-100 border-green-200', 
      gradient: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50/50'
    },
    Behind: { 
      color: 'text-yellow-700 bg-yellow-100 border-yellow-200', 
      gradient: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50/50'
    },
    'At Risk': { 
      color: 'text-red-700 bg-red-100 border-red-200', 
      gradient: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50/50'
    },
    Completed: { 
      color: 'text-blue-700 bg-blue-100 border-blue-200', 
      gradient: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50/50'
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