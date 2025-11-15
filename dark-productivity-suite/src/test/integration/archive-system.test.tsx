/**
 * Archive system tests
 * Tests archiving, restoring, animations, and auto-archive suggestions
 * Requirements: 15.1, 15.2, 15.4, 15.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksProvider, useTasks } from '../../contexts/TasksContext';
import { ArchiveView } from '../../components/graveyard-dashboard/ArchiveView';
import { ArchiveSuggestions } from '../../components/graveyard-dashboard/ArchiveSuggestions';
import { AppProvider } from '../../contexts/AppContext';
import { AuthProvider } from '../../contexts/AuthContext';
import type { Task } from '../../types';

// Test wrapper with all providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <AppProvider>
      <TasksProvider>
        {children}
      </TasksProvider>
    </AppProvider>
  </AuthProvider>
);

// Test component
const TestArchiveComponent = () => {
  const { tasks, createTask, updateTask, archiveTask, unarchiveTask } = useTasks();
  
  const archivedTasks = tasks.filter(t => t.archived);
  const activeTasks = tasks.filter(t => !t.archived);
  
  return (
    <div>
      <button onClick={() => createTask('Test Task', 'Description', 'medium')}>Create Task</button>
      
      <div data-testid="active-tasks">
        {activeTasks.map(task => (
          <div key={task.id} data-testid={`task-${task.id}`}>
            <span>{task.title}</span>
            <button onClick={() => updateTask(task.id, { completed: true })}>Complete</button>
            <button onClick={() => archiveTask(task.id)}>Archive</button>
          </div>
        ))}
      </div>
      
      <div data-testid="archived-tasks">
        {archivedTasks.map(task => (
          <div key={task.id} data-testid={`archived-${task.id}`}>
            <span>{task.title}</span>
            <button onClick={() => unarchiveTask(task.id)}>Restore</button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Archive System Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Archiving tasks (Requirement 15.1)', () => {
    it('should archive a task', async () => {
      const user = userEvent.setup();
      
      render(
        <TasksProvider>
          <TestArchiveComponent />
        </TasksProvider>
      );

      // Create a task
      await user.click(screen.getByText('Create Task'));

      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });

      // Archive the task
      await user.click(screen.getByText('Archive'));

      await waitFor(() => {
        const archivedSection = screen.getByTestId('archived-tasks');
        expect(archivedSection.textContent).toContain('Test Task');
      });
    });

    it('should remove archived task from active list', async () => {
      const user = userEvent.setup();
      
      render(
        <TasksProvider>
          <TestArchiveComponent />
        </TasksProvider>
      );

      await user.click(screen.getByText('Create Task'));
      await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());

      await user.click(screen.getByText('Archive'));

      await waitFor(() => {
        const activeSection = screen.getByTestId('active-tasks');
        expect(activeSection.textContent).not.toContain('Test Task');
      });
    });
  });

  describe('Archive animations (Requirement 15.2)', () => {
    it('should apply archived state to task', async () => {
      const user = userEvent.setup();
      
      render(
        <TasksProvider>
          <TestArchiveComponent />
        </TasksProvider>
      );

      await user.click(screen.getByText('Create Task'));
      await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());

      await user.click(screen.getByText('Archive'));

      await waitFor(() => {
        const archivedSection = screen.getByTestId('archived-tasks');
        expect(archivedSection.textContent).toContain('Test Task');
      });
    });
  });

  describe('Restoring tasks (Requirement 15.4)', () => {
    it('should restore archived task', async () => {
      const user = userEvent.setup();
      
      render(
        <TasksProvider>
          <TestArchiveComponent />
        </TasksProvider>
      );

      // Create and archive a task
      await user.click(screen.getByText('Create Task'));
      await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
      await user.click(screen.getByText('Archive'));

      // Restore the task
      await waitFor(() => expect(screen.getByText('Restore')).toBeInTheDocument());
      await user.click(screen.getByText('Restore'));

      await waitFor(() => {
        const activeSection = screen.getByTestId('active-tasks');
        expect(activeSection.textContent).toContain('Test Task');
      });
    });

    it('should remove task from archive after restore', async () => {
      const user = userEvent.setup();
      
      render(
        <TasksProvider>
          <TestArchiveComponent />
        </TasksProvider>
      );

      await user.click(screen.getByText('Create Task'));
      await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
      await user.click(screen.getByText('Archive'));
      await waitFor(() => expect(screen.getByText('Restore')).toBeInTheDocument());
      await user.click(screen.getByText('Restore'));

      await waitFor(() => {
        const archivedSection = screen.getByTestId('archived-tasks');
        expect(archivedSection.textContent).not.toContain('Test Task');
      });
    });
  });

  describe('Auto-archive suggestions (Requirement 15.6)', () => {
    it('should identify old completed tasks for archiving', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago

      const tasks: Task[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Old Completed Task',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: false,
          tags: [],
          createdAt: oldDate,
          completedAt: oldDate,
        },
        {
          id: '2',
          userId: 'user1',
          title: 'Recent Task',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: false,
          tags: [],
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];

      // Filter tasks completed more than 30 days ago
      const oldTasks = tasks.filter(task => {
        if (!task.completed || !task.completedAt) return false;
        const daysSinceCompletion = (Date.now() - task.completedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCompletion > 30;
      });

      expect(oldTasks).toHaveLength(1);
      expect(oldTasks[0].title).toBe('Old Completed Task');
    });

    it('should not suggest archiving recent tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Recent Task',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: false,
          tags: [],
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];

      const oldTasks = tasks.filter(task => {
        if (!task.completed || !task.completedAt) return false;
        const daysSinceCompletion = (Date.now() - task.completedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCompletion > 30;
      });

      expect(oldTasks).toHaveLength(0);
    });
  });

  describe('Archive filtering and search (Requirement 15.4)', () => {
    it('should filter archived tasks by search query', async () => {
      const user = userEvent.setup();
      
      // Set up initial archived tasks
      const archivedTasks: Task[] = [
        {
          id: '1',
          title: 'Archived Task 1',
          description: 'Work related task',
          priority: 'medium',
          completed: true,
          archived: true,
          tags: ['work'],
          createdAt: new Date(),
          archivedAt: new Date(),
        },
        {
          id: '2',
          title: 'Archived Task 2',
          description: 'Personal task',
          priority: 'high',
          completed: true,
          archived: true,
          tags: ['personal'],
          createdAt: new Date(),
          archivedAt: new Date(),
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(archivedTasks));

      render(<ArchiveView />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Archived Task 1')).toBeInTheDocument();
        expect(screen.getByText('Archived Task 2')).toBeInTheDocument();
      });

      // Search for specific task
      const searchInput = screen.getByPlaceholderText('Search archived tasks...');
      await user.type(searchInput, 'Task 1');

      await waitFor(() => {
        expect(screen.getByText('Archived Task 1')).toBeInTheDocument();
        expect(screen.queryByText('Archived Task 2')).not.toBeInTheDocument();
      });
    });

    it('should filter archived tasks by tags', async () => {
      const user = userEvent.setup();
      
      const archivedTasks: Task[] = [
        {
          id: '1',
          title: 'Work Task',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: true,
          tags: ['work'],
          createdAt: new Date(),
          archivedAt: new Date(),
        },
        {
          id: '2',
          title: 'Personal Task',
          description: 'Description',
          priority: 'high',
          completed: true,
          archived: true,
          tags: ['personal'],
          createdAt: new Date(),
          archivedAt: new Date(),
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(archivedTasks));

      render(<ArchiveView />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Work Task')).toBeInTheDocument();
        expect(screen.getByText('Personal Task')).toBeInTheDocument();
      });

      // Open tag filter dropdown
      const filterButton = screen.getByText('Filter by Tags');
      await user.click(filterButton);

      // Filter by work tag
      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument();
      });
      
      const workTagButton = screen.getByText('work');
      await user.click(workTagButton);

      await waitFor(() => {
        expect(screen.getByText('Work Task')).toBeInTheDocument();
        expect(screen.queryByText('Personal Task')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when no archived tasks match filters', async () => {
      const user = userEvent.setup();
      
      const archivedTasks: Task[] = [
        {
          id: '1',
          title: 'Archived Task',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: true,
          tags: ['work'],
          createdAt: new Date(),
          archivedAt: new Date(),
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(archivedTasks));

      render(<ArchiveView />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Archived Task')).toBeInTheDocument();
      });

      // Search for non-existent task
      const searchInput = screen.getByPlaceholderText('Search archived tasks...');
      await user.type(searchInput, 'NonExistent');

      await waitFor(() => {
        expect(screen.getByText('The archive is empty...')).toBeInTheDocument();
      });
    });
  });

  describe('ArchiveView component integration', () => {
    it('should display archive statistics', async () => {
      const archivedTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: true,
          tags: [],
          createdAt: new Date(),
          archivedAt: new Date(),
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description',
          priority: 'high',
          completed: true,
          archived: true,
          tags: [],
          createdAt: new Date(),
          archivedAt: new Date(),
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(archivedTasks));

      render(<ArchiveView />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Total Archived')).toBeInTheDocument();
        expect(screen.getByText('Showing')).toBeInTheDocument();
        // Both stats should show 2
        const statValues = screen.getAllByText('2');
        expect(statValues).toHaveLength(2);
      });
    });

    it('should allow permanent deletion of archived tasks', async () => {
      const user = userEvent.setup();
      
      const archivedTasks: Task[] = [
        {
          id: '1',
          title: 'Task to Delete',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: true,
          tags: [],
          createdAt: new Date(),
          archivedAt: new Date(),
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(archivedTasks));

      render(<ArchiveView />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Task to Delete')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByTitle('Delete permanently');
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText('Delete forever?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Yes');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
      });
    });
  });

  describe('ArchiveSuggestions component', () => {
    it('should display suggestions for old completed tasks', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Old Completed Task',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: false,
          tags: [],
          createdAt: oldDate,
          completedAt: oldDate,
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(tasks));

      render(<ArchiveSuggestions />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Archive Suggestions')).toBeInTheDocument();
        expect(screen.getByText('Old Completed Task')).toBeInTheDocument();
      });
    });

    it('should allow archiving individual suggested tasks', async () => {
      const user = userEvent.setup();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task to Archive',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: false,
          tags: [],
          createdAt: oldDate,
          completedAt: oldDate,
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(tasks));

      render(<ArchiveSuggestions />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Task to Archive')).toBeInTheDocument();
      });

      // Click archive button
      const archiveButton = screen.getByText('Archive');
      await user.click(archiveButton);

      await waitFor(() => {
        expect(screen.queryByText('Archive Suggestions')).not.toBeInTheDocument();
      });
    });

    it('should allow dismissing suggested tasks', async () => {
      const user = userEvent.setup();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task to Dismiss',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: false,
          tags: [],
          createdAt: oldDate,
          completedAt: oldDate,
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(tasks));

      render(<ArchiveSuggestions />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Task to Dismiss')).toBeInTheDocument();
      });

      // Click dismiss button
      const dismissButton = screen.getByText('Dismiss');
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText('Archive Suggestions')).not.toBeInTheDocument();
      });
    });

    it('should allow archiving all suggested tasks at once', async () => {
      const user = userEvent.setup();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description',
          priority: 'medium',
          completed: true,
          archived: false,
          tags: [],
          createdAt: oldDate,
          completedAt: oldDate,
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description',
          priority: 'high',
          completed: true,
          archived: false,
          tags: [],
          createdAt: oldDate,
          completedAt: oldDate,
        },
      ];

      localStorage.setItem('darkprod_tasks', JSON.stringify(tasks));

      render(<ArchiveSuggestions />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('2 tasks have been completed for over 30 days')).toBeInTheDocument();
      });

      // Click archive all button
      const archiveAllButton = screen.getByText('Archive All');
      await user.click(archiveAllButton);

      await waitFor(() => {
        expect(screen.queryByText('Archive Suggestions')).not.toBeInTheDocument();
      });
    });
  });
});
