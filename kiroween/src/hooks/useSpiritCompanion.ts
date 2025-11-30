import { useMemo } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { useNotes } from '../contexts/NotesContext';
import { achievements } from '../utils/achievements';

export const useSpiritCompanion = () => {
  const { tasks } = useTasks();
  const { notes } = useNotes();

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed).length;
    const unlockedAchievements = achievements.filter(achievement => 
      achievement.isUnlocked({ tasks, notes })
    ).length;

    return {
      achievementCount: unlockedAchievements,
      taskCompletionCount: completedTasks,
      totalTasks: tasks.length,
      totalNotes: notes.length,
    };
  }, [tasks, notes]);

  return stats;
};
