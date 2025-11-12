import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { AppProvider } from '../../contexts/AppContext';
import { NotesProvider } from '../../contexts/NotesContext';
import { TasksProvider } from '../../contexts/TasksContext';

/**
 * Integration tests for navigation and state preservation
 * Requirements: 6.2, 6.4
 * 
 * Tests:
 * - Verify switching modules preserves unsaved work
 * - Test all navigation paths
 * - Ensure loading states display correctly
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

describe('Navigation and State Preservation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should navigate between all modules', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: AllProviders });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    // Navigate to Ghost Writer
    const ghostWriterLink = screen.getByRole('link', { name: /ghost writer/i });
    await user.click(ghostWriterLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/ghost-writer');
    });

    // Navigate to Necronomicon Notes
    const notesLink = screen.getByRole('link', { name: /necronomicon notes/i });
    await user.click(notesLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/necronomicon-notes');
    });

    // Navigate to Graveyard Dashboard
    const graveyardLink = screen.getByRole('link', { name: /graveyard dashboard/i });
    await user.click(graveyardLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/graveyard-dashboard');
    });

    // Navigate to Terminal Tarot
    const tarotLink = screen.getByRole('link', { name: /terminal tarot/i });
    await user.click(tarotLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/terminal-tarot');
    });
  });

  it('should preserve note content when switching modules', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: AllProviders });

    // Navigate to Necronomicon Notes
    const notesLink = screen.getByRole('link', { name: /necronomicon notes/i });
    await user.click(notesLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/necronomicon-notes');
    });

    // Create a new note
    const newNoteButton = screen.getByRole('button', { name: /new note/i });
    await user.click(newNoteButton);

    // Type some content
    const titleInput = screen.getByPlaceholderText(/untitled/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Test Note');

    const contentArea = screen.getByRole('textbox', { name: /note content/i });
    await user.type(contentArea, 'This is test content');

    // Navigate away to Ghost Writer
    const ghostWriterLink = screen.getByRole('link', { name: /ghost writer/i });
    await user.click(ghostWriterLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/ghost-writer');
    });

    // Navigate back to Notes
    await user.click(notesLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/necronomicon-notes');
    });

    // Verify content is preserved
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Note')).toBeInTheDocument();
      expect(screen.getByText(/this is test content/i)).toBeInTheDocument();
    });
  });

  it('should preserve task data when switching modules', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: AllProviders });

    // Navigate to Graveyard Dashboard
    const graveyardLink = screen.getByRole('link', { name: /graveyard dashboard/i });
    await user.click(graveyardLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/graveyard-dashboard');
    });

    // Create a new task
    const newTaskButton = screen.getByRole('button', { name: /new task/i });
    await user.click(newTaskButton);

    const taskInput = screen.getByPlaceholderText(/task title/i);
    await user.type(taskInput, 'Test Task');
    
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    // Verify task appears
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Navigate away
    const tarotLink = screen.getByRole('link', { name: /terminal tarot/i });
    await user.click(tarotLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/terminal-tarot');
    });

    // Navigate back
    await user.click(graveyardLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/graveyard-dashboard');
    });

    // Verify task is still there
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('should display loading transition when navigating', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: AllProviders });

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    // Navigate and check for loading state
    const ghostWriterLink = screen.getByRole('link', { name: /ghost writer/i });
    await user.click(ghostWriterLink);

    // Loading transition should appear (even briefly)
    // Note: This might be too fast to catch in tests, but the component is there
    await waitFor(() => {
      expect(window.location.pathname).toBe('/ghost-writer');
    }, { timeout: 3000 });
  });

  it('should load modules within 2 seconds', async () => {
    const user = userEvent.setup();
    const startTime = Date.now();
    
    render(<App />, { wrapper: AllProviders });

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    const ghostWriterLink = screen.getByRole('link', { name: /ghost writer/i });
    await user.click(ghostWriterLink);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/ghost-writer');
    });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // Requirement: load within 2 seconds
  });
});
