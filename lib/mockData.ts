// app/mockData.ts
import { Goal } from '@/components/GoalCard';

export const mockGoals: Goal[] = [
  {
    id: '1',
    description: 'Complete Q3 React Native project',
    progress_pct: 75,
    status: 'On Track',
    expected_progress: 80,
  },
  {
    id: '2',
    description: 'Learn advanced TypeScript features',
    progress_pct: 50,
    status: 'Behind',
    expected_progress: 60,
  },
  {
    id: '3',
    description: 'Prepare for Solution Architect certification',
    progress_pct: 30,
    status: 'At Risk',
    expected_progress: 40,
  },
  {
    id: '4',
    description: 'Migrate legacy Java service to Spring Boot',
    progress_pct: 95,
    status: 'On Track',
    expected_progress: 90,
  },
  {
    id: '5',
    description: 'Improve SQL query optimization skills',
    progress_pct: 100,
    status: 'Completed',
    expected_progress: 100,
  },
];