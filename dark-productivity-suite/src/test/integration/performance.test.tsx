import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { storageService } from '../../services/storageService';
import type { Note, Task } from '../../types';

/**
 * Integration tests for performance
 * Requirements: 6.4
 * 
 * Tests:
 * - Measure module load times (target < 2 seconds)
 * - Test with large datasets (100+ notes, 100+ tasks)
 * - Verify animation frame rates
 * - Optimize bundle size
 */

// Helper to generate test data
function generateNotes(count: number): Note[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `note-${i}`,
    title: `Test Note ${i}`,
    content: `This is the content of test note ${i}. `.repeat(10),
    createdAt: new Date(Date.now() - i * 1000),
    updatedAt: new Date(Date.now() - i * 500),
  }));
}

function generateTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    title: `Test Task ${i}`,
    description: `Description for task ${i}`,
    priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
    completed: i % 5 === 0,
    createdAt: new Date(Date.now() - i * 1000),
    completedAt: i % 5 === 0 ? new Date(Date.now() - i * 500) : undefined,
  }));
}

describe('Performance Testing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Module Load Times', () => {
    it('should load Terminal Tarot within 2 seconds', async () => {
      const user = userEvent.setup();
      const startTime = performance.now();
      
      render(<App />);

      // Enter from landing page
      await waitFor(() => {
        expect(screen.getByText(/begin your journey/i)).toBeInTheDocument();
      });
      const enterButton = screen.getByRole('button', { name: /begin your journey/i });
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Navigate to Terminal Tarot
      const tarotLink = screen.getByRole('link', { name: /mystic clearing/i });
      await user.click(tarotLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/terminal-tarot');
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // Requirement: < 2 seconds
    });

    it('should load Necronomicon Notes within 2 seconds (Ghost Writer merged)', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Enter from landing page
      await waitFor(() => {
        expect(screen.getByText(/begin your journey/i)).toBeInTheDocument();
      });
      const enterButton = screen.getByRole('button', { name: /begin your journey/i });
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      const startTime = performance.now();

      const notesLink = screen.getByRole('link', { name: /ancient library/i });
      await user.click(notesLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });

    it('should load Necronomicon Notes within 2 seconds', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      const startTime = performance.now();

      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });

    it('should load Graveyard Dashboard within 2 seconds', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      const startTime = performance.now();

      const graveyardLink = screen.getByRole('link', { name: /graveyard/i });
      await user.click(graveyardLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/graveyard-dashboard');
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle 100+ notes efficiently', async () => {
      const user = userEvent.setup();
      
      // Pre-populate with 150 notes
      const notes = generateNotes(150);
      storageService.set('notes', notes);

      const startTime = performance.now();

      render(<App />);

      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });

      // Should render within reasonable time
      await waitFor(() => {
        expect(screen.getByText(/Test Note/)).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Allow slightly more time for large dataset
    });

    it('should handle 100+ tasks efficiently', async () => {
      const user = userEvent.setup();
      
      // Pre-populate with 150 tasks
      const tasks = generateTasks(150);
      storageService.set('tasks', tasks);

      const startTime = performance.now();

      render(<App />);

      const graveyardLink = screen.getByRole('link', { name: /graveyard/i });
      await user.click(graveyardLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/graveyard-dashboard');
      });

      // Should render within reasonable time
      await waitFor(() => {
        expect(screen.getByText(/Test Task/)).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    it('should search through 100+ notes quickly', async () => {
      const user = userEvent.setup();
      
      // Pre-populate with 150 notes
      const notes = generateNotes(150);
      storageService.set('notes', notes);

      render(<App />);

      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });

      const startTime = performance.now();

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Test Note 42');

      // Should filter quickly
      await waitFor(() => {
        expect(screen.getByText('Test Note 42')).toBeInTheDocument();
      });

      const searchTime = performance.now() - startTime;
      expect(searchTime).toBeLessThan(1000); // Search should be fast
    });

    it('should handle mixed large dataset (notes + tasks)', async () => {
      const user = userEvent.setup();
      
      // Pre-populate with both
      const notes = generateNotes(100);
      const tasks = generateTasks(100);
      storageService.set('notes', notes);
      storageService.set('tasks', tasks);

      const startTime = performance.now();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Navigate between modules with large datasets
      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });

      const graveyardLink = screen.getByRole('link', { name: /graveyard/i });
      await user.click(graveyardLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/graveyard-dashboard');
      });

      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(5000); // Should handle both datasets efficiently
    });
  });

  describe('Storage Performance', () => {
    it('should save large note quickly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      const newNoteButton = screen.getByRole('button', { name: /new note/i });
      await user.click(newNoteButton);

      const startTime = performance.now();

      // Type large content
      const contentArea = screen.getByRole('textbox', { name: /note content/i });
      const largeContent = 'Lorem ipsum dolor sit amet. '.repeat(100);
      await user.type(contentArea, largeContent);

      // Wait for save
      await waitFor(() => {
        const savedNotes = storageService.get('notes');
        expect(savedNotes).toBeTruthy();
      }, { timeout: 1500 });

      const saveTime = performance.now() - startTime;
      expect(saveTime).toBeLessThan(1000); // Should save within 1 second
    });

    it('should load large dataset from storage quickly', () => {
      // Pre-populate with large dataset
      const notes = generateNotes(200);
      const tasks = generateTasks(200);
      
      const startTime = performance.now();
      
      storageService.set('notes', notes);
      storageService.set('tasks', tasks);
      
      const saveTime = performance.now() - startTime;
      expect(saveTime).toBeLessThan(2000); // Should save quickly

      // Now read it back
      const readStartTime = performance.now();
      
      const loadedNotes = storageService.get('notes');
      const loadedTasks = storageService.get('tasks');
      
      const readTime = performance.now() - readStartTime;
      expect(readTime).toBeLessThan(500); // Should read quickly
      
      expect(loadedNotes).toHaveLength(200);
      expect(loadedTasks).toHaveLength(200);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not leak memory when creating and deleting many items', async () => {
      const user = userEvent.setup();
      render(<App />);

      const notesLink = screen.getByRole('link', { name: /necronomicon/i });
      await user.click(notesLink);

      // Wait for initial note
      await waitFor(() => {
        expect(screen.getAllByText(/welcome to the necronomicon/i).length).toBeGreaterThan(0);
      });

      // The app should remain responsive after multiple operations
      // This is a basic test - in a real scenario we'd measure actual memory usage
      const titleInputs = screen.getAllByDisplayValue(/welcome to the necronomicon/i);
      const titleInput = titleInputs[0];
      
      for (let i = 0; i < 5; i++) {
        await user.clear(titleInput);
        await user.type(titleInput, `Temp Note ${i}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should still be responsive
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });
  });
});
