// components/GoalCard.tsx
import React from 'react';
import { twMerge } from 'tailwind-merge';

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
  const statusMap: Record<GoalStatus, { color: string; gradient: string }> = {
    'On Track': { color: 'bg-green-100 text-green-800', gradient: 'from-green-400 to-green-600' },
    Behind: { color: 'bg-yellow-100 text-yellow-800', gradient: 'from-yellow-400 to-yellow-600' },
    'At Risk': { color: 'bg-red-100 text-red-800', gradient: 'from-red-400 to-red-600' },
    Completed: { color: 'bg-blue-100 text-blue-800', gradient: 'from-blue-400 to-blue-600' },
  };

  const { color, gradient } = statusMap[goal.status];

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 p-5 shadow-md space-y-3 animate-fadeIn">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.description}</h3>

      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{
        goal.status
      }</span>

      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">
        <div
          className={twMerge('h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r', ` ${gradient}`)}
          style={{ width: `${goal.progress_pct}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Progress {goal.progress_pct}%{goal.status !== 'Completed' && <> • Expected {goal.expected_progress}%</>}
      </p>

      <button className="btn btn-sm btn-gradient mt-2">View Details (Mock)</button>
    </div>
  );
};

export default GoalCard;