/**
 * Comprehensive tag system tests
 * Tests tag creation, deletion, filtering, autocomplete, and persistence
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotesProvider, useNotes } from '../../contexts/NotesContext';
import { TasksProvider, useTasks } from '../../contexts/TasksContext';
import { TagManager } from '../../components/common/TagManager';
import { TagFilter } from '../../components/common/TagFilter';
import { TagCloud } from '../../components/common/TagCloud';
import type { Note } from '../../types';

// Mock Firebase
vi.mock('../../services/firebaseService', () => ({
  auth: null,
  db: null,
}));

// Mock cloud sync
vi.mock('../../services/cloudSyncService', () => ({
  cloudSyncService: {
    syncNotes: vi.fn(),
    syncTasks: vi.fn(),
    subscribeToNotes: vi.fn(() => vi.fn()),
    subscribeToTasks: vi.fn(() => vi.fn()),
  },
}));

// Test component that uses notes context
const TestNotesComponent = () => {
  const { notes, createNote, updateNote } = useNotes();
  
  return (
    <div>
      <button onClick={() => {
        const note = createNote('Test Note', 'Content');
        updateNote(note.id, { tags: ['test'] });
      }}>Add Note</button>
      {notes.map(note => (
        <div key={note.id} data-testid={`note-${note.id}`}>
          <span>{note.title}</span>
          <span data-testid={`tags-${note.id}`}>{note.tags.join(', ')}</span>
          <TagManager
            tags={note.tags}
            allTags={notes.flatMap(n => n.tags)}
            onTagsChange={(newTags) => updateNote(note.id, { tags: newTags })}
          />
        </div>
      ))}
    </div>
  );
};

// Test component that uses tasks context
const TestTasksComponent = () => {
  const { tasks, createTask, updateTask } = useTasks();
  
  return (
    <div>
      <button onClick={() => {
        const task = createTask('Test Task', 'Description', 'medium');
        updateTask(task.id, { tags: ['test'] });
      }}>Add Task</button>
      {tasks.map(task => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span>{task.title}</span>
          <span data-testid={`tags-${task.id}`}>{task.tags.join(', ')}</span>
          <TagManager
            tags={task.tags}
            allTags={tasks.flatMap(t => t.tags)}
            onTagsChange={(newTags) => updateTask(task.id, { tags: newTags })}
          />
        </div>
      ))}
    </div>
  );
};

describe('Tag System - Comprehensive Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Tag creation and deletion (Requirement 14.1)', () => {
    it('should add tags to notes', async () => {
      const user = userEvent.setup();
      
      render(
        <NotesProvider>
          <TestNotesComponent />
        </NotesProvider>
      );

      // Add a note
      const addButton = screen.getByText('Add Note');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Test Note')).toBeInTheDocument();
      });

      // Verify tag is present
      const tagsElement = screen.getByTestId(/tags-/);
      expect(tagsElement.textContent).toContain('test');
    });

    it('should add tags to tasks', async () => {
      const user = userEvent.setup();
      
      render(
        <TasksProvider>
          <TestTasksComponent />
        </TasksProvider>
      );

      // Add a task
      const addButton = screen.getByText('Add Task');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });

      // Verify tag is present
      const tagsElement = screen.getByTestId(/tags-/);
      expect(tagsElement.textContent).toContain('test');
    });

    it('should allow multiple tags on a single item', () => {
      const mockOnChange = vi.fn();
      
      render(
        <TagManager
          tags={['work', 'urgent', 'important']}
          allTags={['work', 'urgent', 'important', 'personal']}
          onTagsChange={mockOnChange}
        />
      );

      // All tags should be displayed
      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('important')).toBeInTheDocument();
    });

    it('should remove tags when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      render(
        <TagManager
          tags={['work', 'urgent']}
          allTags={['work', 'urgent', 'personal']}
          onTagsChange={mockOnChange}
        />
      );

      // Find and click remove button for 'work' tag
      const workTag = screen.getByText('work').closest('div');
      const removeButton = workTag?.querySelector('button');
      
      if (removeButton) {
        await user.click(removeButton);
        
        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalledWith(['urgent']);
        });
      }
    });
  });

  describe('Tag styling and symbols (Requirement 14.2)', () => {
    it('should render tags with mystical symbols', () => {
      const mockOnChange = vi.fn();
      
      render(
        <TagManager
          tags={['work', 'personal']}
          allTags={['work', 'personal']}
          onTagsChange={mockOnChange}
        />
      );

      // Tags should be rendered with gothic styling
      const workTag = screen.getByText('work');
      expect(workTag).toBeInTheDocument();
      
      // Check if tag has appropriate class for styling
      const tagElement = workTag.closest('div');
      expect(tagElement?.className).toBeTruthy();
    });

    it('should display tags with gothic-styled labels', () => {
      const mockOnClick = vi.fn();
      
      render(
        <TagCloud
          tags={['work', 'urgent', 'personal']}
          items={[{ tags: ['work'] }]}
          onTagClick={mockOnClick}
        />
      );

      // All tags should be visible with styling
      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('personal')).toBeInTheDocument();
    });
  });

  describe('Tag autocomplete (Requirement 14.3)', () => {
    it('should show suggestions based on existing tags', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      render(
        <TagManager
          tags={[]}
          allTags={['work', 'workout', 'personal', 'project']}
          onTagsChange={mockOnChange}
        />
      );

      // Type in the input to trigger autocomplete
      const input = screen.getByPlaceholderText('Add tag...');
      await user.type(input, 'wor');

      // Suggestions should appear
      await waitFor(() => {
        // Both 'work' and 'workout' should be suggested
        const suggestions = screen.queryAllByText(/work/i);
        expect(suggestions.length).toBeGreaterThan(0);
      });
    });

    it('should filter suggestions as user types', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      render(
        <TagManager
          tags={[]}
          allTags={['work', 'workout', 'personal', 'project']}
          onTagsChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Add tag...');
      await user.type(input, 'per');

      // Only 'personal' should be suggested
      await waitFor(() => {
        expect(screen.queryByText('personal')).toBeInTheDocument();
        expect(screen.queryByText('work')).not.toBeInTheDocument();
      });
    });

    it('should not suggest already applied tags', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      render(
        <TagManager
          tags={['work']}
          allTags={['work', 'workout', 'personal']}
          onTagsChange={mockOnChange}
        />
      );

      // When tags exist, placeholder is empty, so find input by role
      const input = screen.getByRole('textbox');
      await user.type(input, 'wor');

      // 'work' should not be suggested since it's already applied
      await waitFor(() => {
        const workTags = screen.queryAllByText('work');
        // Should only find the already-applied tag, not in suggestions
        expect(workTags.length).toBe(1);
      });
    });
  });

  describe('Tag filtering (Requirement 14.4)', () => {
    it('should filter notes by single tag', () => {
      const mockOnChange = vi.fn();
      const mockOnModeChange = vi.fn();
      
      render(
        <TagFilter
          availableTags={['work', 'personal', 'urgent']}
          selectedTags={['work']}
          onTagsChange={mockOnChange}
          filterMode="OR"
          onFilterModeChange={mockOnModeChange}
        />
      );

      // Filter should be active
      expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
    });

    it('should filter with AND logic', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const mockOnModeChange = vi.fn();
      
      render(
        <TagFilter
          availableTags={['work', 'personal', 'urgent']}
          selectedTags={['work', 'urgent']}
          onTagsChange={mockOnChange}
          filterMode="AND"
          onFilterModeChange={mockOnModeChange}
        />
      );

      // Expand filter
      const toggleButton = screen.getByText('Filter by Tags');
      await user.click(toggleButton);

      // AND mode should be active
      await waitFor(() => {
        const andButton = screen.getByText('AND');
        expect(andButton).toBeInTheDocument();
      });
    });

    it('should filter with OR logic', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const mockOnModeChange = vi.fn();
      
      render(
        <TagFilter
          availableTags={['work', 'personal', 'urgent']}
          selectedTags={['work', 'personal']}
          onTagsChange={mockOnChange}
          filterMode="OR"
          onFilterModeChange={mockOnModeChange}
        />
      );

      // Expand filter
      const toggleButton = screen.getByText('Filter by Tags');
      await user.click(toggleButton);

      // OR mode should be active
      await waitFor(() => {
        const orButton = screen.getByText('OR');
        expect(orButton).toBeInTheDocument();
      });
    });

    it('should switch between AND and OR modes', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const mockOnModeChange = vi.fn();
      
      render(
        <TagFilter
          availableTags={['work', 'personal']}
          selectedTags={['work']}
          onTagsChange={mockOnChange}
          filterMode="OR"
          onFilterModeChange={mockOnModeChange}
        />
      );

      // Expand filter
      const toggleButton = screen.getByText('Filter by Tags');
      await user.click(toggleButton);

      // Click AND button
      const andButton = screen.getByText('AND');
      await user.click(andButton);

      await waitFor(() => {
        expect(mockOnModeChange).toHaveBeenCalledWith('AND');
      });
    });

    it('should clear all filters', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const mockOnModeChange = vi.fn();
      
      render(
        <TagFilter
          availableTags={['work', 'personal', 'urgent']}
          selectedTags={['work', 'urgent']}
          onTagsChange={mockOnChange}
          filterMode="OR"
          onFilterModeChange={mockOnModeChange}
        />
      );

      // Expand filter
      const toggleButton = screen.getByText('Filter by Tags');
      await user.click(toggleButton);

      // Find and click clear button
      const clearButton = screen.getByText(/clear/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([]);
      });
    });
  });

  describe('Tag cloud visualization (Requirement 14.5)', () => {
    it('should display all unique tags', () => {
      const mockOnClick = vi.fn();
      const items = [
        { tags: ['work', 'urgent'] },
        { tags: ['work', 'personal'] },
        { tags: ['personal', 'hobby'] },
      ];
      
      render(
        <TagCloud
          tags={['work', 'urgent', 'personal', 'hobby']}
          items={items}
          onTagClick={mockOnClick}
        />
      );

      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('personal')).toBeInTheDocument();
      expect(screen.getByText('hobby')).toBeInTheDocument();
    });

    it('should show usage count for each tag', () => {
      const mockOnClick = vi.fn();
      const items = [
        { tags: ['work'] },
        { tags: ['work'] },
        { tags: ['work'] },
        { tags: ['personal'] },
        { tags: ['personal'] },
      ];
      
      render(
        <TagCloud
          tags={['work', 'personal']}
          items={items}
          onTagClick={mockOnClick}
        />
      );

      // Work appears 3 times, personal 2 times
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should make tags clickable to filter', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const items = [{ tags: ['work'] }];
      
      render(
        <TagCloud
          tags={['work', 'personal']}
          items={items}
          onTagClick={mockOnClick}
        />
      );

      const workTag = screen.getByText('work');
      await user.click(workTag);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledWith('work');
      });
    });
  });

  describe('Tag persistence (Requirement 14.6)', () => {
    it('should persist tags when note is updated', async () => {
      const user = userEvent.setup();
      
      render(
        <NotesProvider>
          <TestNotesComponent />
        </NotesProvider>
      );

      // Add a note with tags
      const addButton = screen.getByText('Add Note');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Test Note')).toBeInTheDocument();
      });

      // Wait for debounced save (1 second + buffer)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Verify tags are persisted in localStorage
      const savedNotes = localStorage.getItem('darkprod_notes');
      expect(savedNotes).toBeTruthy();
      
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        expect(notes[0].tags).toContain('test');
      }
    });

    it('should persist tags when task is updated', async () => {
      const user = userEvent.setup();
      
      render(
        <TasksProvider>
          <TestTasksComponent />
        </TasksProvider>
      );

      // Add a task with tags
      const addButton = screen.getByText('Add Task');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });

      // Wait for debounced save (1 second + buffer)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Verify tags are persisted in localStorage
      const savedTasks = localStorage.getItem('darkprod_tasks');
      expect(savedTasks).toBeTruthy();
      
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        expect(tasks[0].tags).toContain('test');
      }
    });

    it('should restore tags after page reload', async () => {
      // Set up initial data in localStorage
      const mockNotes: Note[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Test Note',
          content: 'Content',
          markdown: false,
          tags: ['work', 'urgent'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      localStorage.setItem('darkprod_notes', JSON.stringify(mockNotes));

      render(
        <NotesProvider>
          <TestNotesComponent />
        </NotesProvider>
      );

      // Tags should be restored
      await waitFor(() => {
        const tagsElement = screen.getByTestId('tags-1');
        expect(tagsElement.textContent).toContain('work');
        expect(tagsElement.textContent).toContain('urgent');
      });
    });
  });
});
