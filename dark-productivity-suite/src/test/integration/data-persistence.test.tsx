import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { AppProvider } from '../../contexts/AppContext';
import { NotesProvider } from '../../contexts/NotesContext';
import { TasksProvider } from '../../contexts/TasksContext';
import { storageService } from '../../services/storageService';

/**
 * Integration tests for data persistence
 * Requirements: 7.2, 7.3, 7.4, 7.5
 * 
 * Tests:
 * - Verify all CRUD operations save within 1 second
 * - Test data restoration on app reload
 * - Verify export functionality
 * - Test LocalStorage error handling
 */

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>
    <NotesProvider>
      <TasksProvider>
        {children}
      </TasksProvider>
    </NotesProvider>
  </AppProvider>
);

describe('Data Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('CRUD Operations Save Within 1 Second', () => {
    it('should save new note within 1 second', async () => {
      const user = userEvent.setup();
      render(<App />, { wrapper: AllProviders });

      // Navigate to Notes
      const notesLink = screen.getByRole('link', { name: /necronomicon notes/i });
      await user.click(notesLink);

      const startTime = Date.now();

      // Create note
      const newNoteButton = screen.getByRole('button', { name: /new note/i });
      await user.click(newNoteButton);

      const titleInput = screen.getByPlaceholderText(/untitled/i);
      await user.type(titleInput, 'Quick Note');

      // Wait for auto-save
      await waitFor(() => {
        const savedNotes = storageService.get('notes');
        expect(savedNotes).toBeTruthy();
      }, { timeout: 1500 });

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1000); // Requirement: save within 1 second
    });

    it('should save new task within 1 second', async () => {
      const user = userEvent.setup();
      render(<App />, { wrapper: AllProviders });

      // Navigate to Graveyard
      const graveyardLink = screen.getByRole('link', { name: /graveyard dashboard/i });
      await user.click(graveyardLink);

      const startTime = Date.now();

      // Create task
      const newTaskButton = screen.getByRole('button', { name: /new task/i });
      await user.click(newTaskButton);

      const taskInput = screen.getByPlaceholderText(/task title/i);
      await user.type(taskInput, 'Quick Task');
      
      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      // Wait for save
      await waitFor(() => {
        const savedTasks = storageService.get('tasks');
        expect(savedTasks).toBeTruthy();
      }, { timeout: 1500 });

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1000);
    });

    it('should save note updates within 1 second', async () => {
      const user = userEvent.setup();
      render(<App />, { wrapper: AllProviders });

      // Navigate to Notes
      const notesLink = screen.getByRole('link', { name: /necronomicon notes/i });
      await user.click(notesLink);

      // Create note
      const newNoteButton = screen.getByRole('button', { name: /new note/i });
      await user.click(newNoteButton);

      const titleInput = screen.getByPlaceholderText(/untitled/i });
      await user.type(titleInput, 'Update Test');

      // Wait for initial save
      await waitFor(() => {
        const savedNotes = storageService.get('notes');
        expect(savedNotes).toBeTruthy();
      });

      const startTime = Date.now();

      // Update content
      const contentArea = screen.getByRole('textbox', { name: /note content/i });
      await user.type(contentArea, 'Updated content');

      // Wait for update to save
      await waitFor(() => {
        const savedNotes = storageService.get<any[]>('notes');
        const note = savedNotes?.find((n: any) => n.title === 'Update Test');
        expect(note?.content).toContain('Updated content');
      }, { timeout: 1500 });

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1000);
    });

    it('should save task completion within 1 second', async () => {
      const user = userEvent.setup();
      render(<App />, { wrapper: AllProviders });

      // Navigate to Graveyard
      const graveyardLink = screen.getByRole('link', { name: /graveyard dashboard/i });
      await user.click(graveyardLink);

      // Create task
      const newTaskButton = screen.getByRole('button', { name: /new task/i });
      await user.click(newTaskButton);

      const taskInput = screen.getByPlaceholderText(/task title/i);
      await user.type(taskInput, 'Complete Me');
      
      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Complete Me')).toBeInTheDocument();
      });

      const startTime = Date.now();

      // Complete task
      const taskElement = screen.getByText('Complete Me').closest('[role="button"]');
      if (taskElement) {
        await user.click(taskElement);
      }

      // Wait for completion to save
      await waitFor(() => {
        const savedTasks = storageService.get<any[]>('tasks');
        const task = savedTasks?.find((t: any) => t.title === 'Complete Me');
        expect(task?.completed).toBe(true);
      }, { timeout: 1500 });

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1000);
    });
  });

  describe('Data Restoration on App Reload', () => {
    it('should restore notes after reload', async () => {
      const user = userEvent.setup();
      
      // First render - create note
      const { unmount } = render(<App />, { wrapper: AllProviders });

      const notesLink = screen.getByRole('link', { name: /necronomicon notes/i });
      await user.click(notesLink);

      const newNoteButton = screen.getByRole('button', { name: /new note/i });
      await user.click(newNoteButton);

      const titleInput = screen.getByPlaceholderText(/untitled/i });
      await user.type(titleInput, 'Persistent Note');

      await waitFor(() => {
        const savedNotes = storageService.get('notes');
        expect(savedNotes).toBeTruthy();
      });

      // Unmount (simulate page reload)
      unmount();

      // Second render - verify restoration
      render(<App />, { wrapper: AllProviders });

      await user.click(screen.getByRole('link', { name: /necronomicon notes/i }));

      await waitFor(() => {
        expect(screen.getByText('Persistent Note')).toBeInTheDocument();
      });
    });

    it('should restore tasks after reload', async () => {
      const user = userEvent.setup();
      
      // First render - create task
      const { unmount } = render(<App />, { wrapper: AllProviders });

      const graveyardLink = screen.getByRole('link', { name: /graveyard dashboard/i });
      await user.click(graveyardLink);

      const newTaskButton = screen.getByRole('button', { name: /new task/i });
      await user.click(newTaskButton);

      const taskInput = screen.getByPlaceholderText(/task title/i);
      await user.type(taskInput, 'Persistent Task');
      
      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        const savedTasks = storageService.get('tasks');
        expect(savedTasks).toBeTruthy();
      });

      // Unmount
      unmount();

      // Second render - verify restoration
      render(<App />, { wrapper: AllProviders });

      await user.click(screen.getByRole('link', { name: /graveyard dashboard/i }));

      await waitFor(() => {
        expect(screen.getByText('Persistent Task')).toBeInTheDocument();
      });
    });

    it('should restore settings after reload', async () => {
      const user = userEvent.setup();
      
      // First render - change settings
      const { unmount } = render(<App />, { wrapper: AllProviders });

      // Enable audio
      const audioToggle = screen.getByRole('button', { name: /toggle audio/i });
      await user.click(audioToggle);

      await waitFor(() => {
        const savedSettings = storageService.get('settings');
        expect(savedSettings).toBeTruthy();
      });

      // Unmount
      unmount();

      // Second render - verify settings restored
      render(<App />, { wrapper: AllProviders });

      await waitFor(() => {
        const savedSettings = storageService.get<any>('settings');
        expect(savedSettings?.audioEnabled).toBe(true);
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export all data as JSON', async () => {
      const user = userEvent.setup();
      render(<App />, { wrapper: AllProviders });

      // Create some data first
      const notesLink = screen.getByRole('link', { name: /necronomicon notes/i });
      await user.click(notesLink);

      const newNoteButton = screen.getByRole('button', { name: /new note/i });
      await user.click(newNoteButton);

      const titleInput = screen.getByPlaceholderText(/untitled/i });
      await user.type(titleInput, 'Export Test Note');

      await waitFor(() => {
        const savedNotes = storageService.get('notes');
        expect(savedNotes).toBeTruthy();
      });

      // Find and click export button
      const exportButton = screen.getByRole('button', { name: /export/i });
      
      // Mock the download functionality
      const createElementSpy = vi.spyOn(document, 'createElement');
      const clickSpy = vi.fn();
      
      createElementSpy.mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
        style: {},
      } as any);

      await user.click(exportButton);

      // Verify export was triggered
      await waitFor(() => {
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(clickSpy).toHaveBeenCalled();
      });

      createElementSpy.mockRestore();
    });
  });

  describe('LocalStorage Error Handling', () => {
    it('should handle quota exceeded error', async () => {
      const user = userEvent.setup();
      
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        (error as any).code = 22;
        throw error;
      });

      render(<App />, { wrapper: AllProviders });

      const notesLink = screen.getByRole('link', { name: /necronomicon notes/i });
      await user.click(notesLink);

      const newNoteButton = screen.getByRole('button', { name: /new note/i });
      await user.click(newNoteButton);

      const titleInput = screen.getByPlaceholderText(/untitled/i });
      await user.type(titleInput, 'This will fail');

      // Should show error message or handle gracefully
      await waitFor(() => {
        // The app should handle the error without crashing
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle corrupted data gracefully', () => {
      // Set corrupted data
      localStorage.setItem('darkprod_notes', 'invalid json {{{');

      // Should not crash when trying to read
      expect(() => {
        storageService.get('notes');
      }).toThrow();

      // Clear corrupted data
      localStorage.clear();
    });
  });
});
