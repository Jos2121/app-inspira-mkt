import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DailyLog = {
  id: string;
  date: string;
  count: number;
};

export type Goal = {
  id: string;
  clientId: string;
  monthYear: string;
  targetPatients: number;
  costPerPatient: number;
  dailyLogs: DailyLog[];
};

interface GoalsState {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'dailyLogs'>) => void;
  addDailyLog: (goalId: string, log: Omit<DailyLog, 'id'>) => void;
  deleteGoal: (goalId: string) => void;
}

export const useGoals = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goalData) => set((state) => ({
        goals: [...state.goals, { ...goalData, id: crypto.randomUUID(), dailyLogs: [] }]
      })),
      addDailyLog: (goalId, logData) => set((state) => ({
        goals: state.goals.map(g => 
          g.id === goalId 
            ? { ...g, dailyLogs: [...g.dailyLogs, { ...logData, id: crypto.randomUUID() }] }
            : g
        )
      })),
      deleteGoal: (goalId) => set((state) => ({
        goals: state.goals.filter(g => g.id !== goalId)
      }))
    }),
    { name: 'app-goals-storage' }
  )
);