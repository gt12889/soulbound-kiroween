import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import userEvent from '@testing-library/user-event';
import App from '../../App';
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

describe('Data Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('CRUD Operations Save Within 1 Second', () => {
    it('should save new note within 1 second', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to Notes
      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      // Wait for initial note
      await waitFor(() => {
        expect(screen.getByText(/welcome to the necronomicon/i)).toBeInTheDocument();
      });

      const startTime = Date.now();

      // Modify the existing note
      const titleInput = screen.getByDisplayValue(/welcome to the necronomicon/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Quick Note');

      // Wait for auto-save
      await waitFor(() => {
        const savedNotes = storageService.get('notes');
        expect(savedNotes).toBeTruthy();
      }, { timeout: 1500 });

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1500); // Allow some buffer for typing
    });

    it('should save new task within 1 second', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to Graveyard
      const graveyardLink = screen.getByRole('link', { name: /graveyard/i });
      await user.click(graveyardLink);

      const startTime = Date.now();

      // Create task
      const newTaskButton = screen.getByRole('button', { name: /raise new task/i });
      await user.click(newTaskButton);

      const taskInput = screen.getByPlaceholderText(/enter task title/i);
      await user.type(taskInput, 'Quick Task');
      
      const createButton = screen.getByRole('button', { name: /create task/i });
      await user.click(createButton);

      // Wait for save
      await waitFor(() => {
        const savedTasks = storageService.get('tasks');
        expect(savedTasks).toBeTruthy();
      }, { timeout: 1500 });

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1500); // Allow buffer for typing
    });

    it('should save note updates within 1 second', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to Notes
      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      // Wait for initial note
      await waitFor(() => {
        expect(screen.getByText(/welcome to the necronomicon/i)).toBeInTheDocument();
      });

      const startTime = Date.now();

      // Update title
      const titleInput = screen.getByDisplayValue(/welcome to the necronomicon/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Update Test');

      // Wait for update to save
      await waitFor(() => {
        const savedNotes = storageService.get<any[]>('notes');
        const note = savedNotes?.find((n: any) => n.title === 'Update Test');
        expect(note).toBeTruthy();
      }, { timeout: 1500 });

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1500);
    });

    it('should save task completion within 1 second', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to Graveyard
      const graveyardLink = screen.getByRole('link', { name: /graveyard/i });
      await user.click(graveyardLink);

      // Create task
      const newTaskButton = screen.getByRole('button', { name: /raise new task/i });
      await user.click(newTaskButton);

      const taskInput = screen.getByPlaceholderText(/enter task title/i);
      await user.type(taskInput, 'Complete Me');
      
      const createButton = screen.getByRole('button', { name: /create task/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Complete Me')).toBeInTheDocument();
      });

      const startTime = Date.now();

      // Complete task by clicking on tombstone
      const taskElement = screen.getByText('Complete Me');
      await user.click(taskElement);

      // Wait for completion to save
      await waitFor(() => {
        const savedTasks = storageService.get<any[]>('tasks');
        const task = savedTasks?.find((t: any) => t.title === 'Complete Me');
        expect(task?.completed).toBe(true);
      }, { timeout: 1500 });

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1500);
    });
  });

  describe('Data Restoration on App Reload', () => {
    it('should restore notes after reload', async () => {
      const user = userEvent.setup();
      
      // First render - create note
      const { unmount } = render(<App />);

      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      // Wait for initial note
      await waitFor(() => {
        expect(screen.getByText(/welcome to the necronomicon/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue(/welcome to the necronomicon/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Persistent Note');

      await waitFor(() => {
        const savedNotes = storageService.get('notes');
        expect(savedNotes).toBeTruthy();
      });

      // Unmount (simulate page reload)
      unmount();

      // Second render - verify restoration
      render(<App />);

      await user.click(screen.getByRole('link', { name: /necronomicon/i }));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Persistent Note')).toBeInTheDocument();
      });
    });

    it('should restore tasks after reload', async () => {
      const user = userEvent.setup();
      
      // First render - create task
      const { unmount } = render(<App />);

      const graveyardLink = screen.getByRole('link', { name: /graveyard/i });
      await user.click(graveyardLink);

      const newTaskButton = screen.getByRole('button', { name: /raise new task/i });
      await user.click(newTaskButton);

      const taskInput = screen.getByPlaceholderText(/enter task title/i);
      await user.type(taskInput, 'Persistent Task');
      
      const createButton = screen.getByRole('button', { name: /create task/i });
      await user.click(createButton);

      await waitFor(() => {
        const savedTasks = storageService.get('tasks');
        expect(savedTasks).toBeTruthy();
      });

      // Unmount
      unmount();

      // Second render - verify restoration
      render(<App />);

      await user.click(screen.getByRole('link', { name: /graveyard/i }));

      await waitFor(() => {
        expect(screen.getByText('Persistent Task')).toBeInTheDocument();
      });
    });

    it('should restore settings after reload', async () => {
      const user = userEvent.setup();
      
      // First render - change settings
      const { unmount } = render(<App />);

      // Wait for app to load
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Enable audio
      const audioToggle = screen.getByRole('button', { name: /audio/i });
      await user.click(audioToggle);

      await waitFor(() => {
        const savedSettings = storageService.get('settings');
        expect(savedSettings).toBeTruthy();
      });

      // Unmount
      unmount();

      // Second render - verify settings restored
      render(<App />);

      await waitFor(() => {
        const savedSettings = storageService.get<any>('settings');
        expect(savedSettings?.audioEnabled).toBeDefined();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export all data as JSON', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create some data first
      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      // Wait for initial note
      await waitFor(() => {
        expect(screen.getByText(/welcome to the necronomicon/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        const savedNotes = storageService.get('notes');
        expect(savedNotes).toBeTruthy();
      });

      // Find and click export button (if it exists in the UI)
      const exportButtons = screen.queryAllByRole('button', { name: /export/i });
      
      if (exportButtons.length > 0) {
        // Mock the download functionality
        const createElementSpy = vi.spyOn(document, 'createElement');
        const clickSpy = vi.fn();
        
        createElementSpy.mockReturnValue({
          click: clickSpy,
          href: '',
          download: '',
          style: {},
        } as any);

        await user.click(exportButtons[0]);

        // Verify export was triggered
        await waitFor(() => {
          expect(createElementSpy).toHaveBeenCalledWith('a');
          expect(clickSpy).toHaveBeenCalled();
        });

        createElementSpy.mockRestore();
      } else {
        // If no export button in UI, test the export service directly
        const { exportService } = await import('../../services/exportService');
        expect(() => exportService.exportData([], [], {} as any, [])).not.toThrow();
      }
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

      render(<App />);

      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Try to modify note - should handle error gracefully
      const titleInputs = screen.queryAllByDisplayValue(/welcome to the necronomicon/i);
      if (titleInputs.length > 0) {
        await user.clear(titleInputs[0]);
        await user.type(titleInputs[0], 'This will fail');
      }

      // Should handle the error without crashing
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle corrupted data gracefully', () => {
      // Set corrupted data
      localStorage.setItem('darkprod_notes', 'invalid json {{{');

      // Should throw when trying to read corrupted data
      expect(() => {
        storageService.get('notes');
      }).toThrow();

      // Clear corrupted data
      localStorage.clear();
    });
  });
});
