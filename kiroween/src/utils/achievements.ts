export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: (data: { tasks: any[], notes: any[] }) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first-task',
    title: 'First Step into the Gloom',
    description: 'Create your first task.',
    icon: '➕',
    isUnlocked: ({ tasks }) => tasks.length > 0,
  },
  {
    id: 'first-note',
    title: 'Scribe of Shadows',
    description: 'Write your first note.',
    icon: '✍️',
    isUnlocked: ({ notes }) => notes.length > 0,
  },
  {
    id: 'ten-tasks',
    title: 'Graveyard Regular',
    description: 'Complete 10 tasks.',
    icon: '🪦',
    isUnlocked: ({ tasks }) => tasks.filter(t => t.completed).length >= 10,
  },
  {
    id: 'writer-1000',
    title: 'Tome Weaver',
    description: 'Write over 1000 characters in a single note.',
    icon: '📖',
    isUnlocked: ({ notes }) => notes.some(n => n.content.length >= 1000),
  },
];
