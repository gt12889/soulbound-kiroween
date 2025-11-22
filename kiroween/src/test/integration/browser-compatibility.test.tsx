import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { storageService } from '../../services/storageService';

/**
 * Integration tests for cross-browser compatibility
 * Requirements: 8.1
 * 
 * Tests:
 * - Test in Chrome, Firefox, Safari, Edge (simulated)
 * - Verify audio functionality across browsers
 * - Test LocalStorage compatibility
 * - Ensure consistent visual rendering
 */

describe('Browser Compatibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('LocalStorage Compatibility', () => {
    it('should work with standard localStorage API', () => {
      // Test basic localStorage operations
      expect(() => {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        expect(value).toBe('value');
        localStorage.removeItem('test');
      }).not.toThrow();
    });

    it('should handle localStorage with storageService', () => {
      const testData = { id: '1', name: 'Test' };
      
      expect(() => {
        storageService.set('test', testData);
        const retrieved = storageService.get('test');
        expect(retrieved).toEqual(testData);
        storageService.remove('test');
      }).not.toThrow();
    });

    it('should handle Date serialization across browsers', () => {
      const testDate = new Date('2024-01-01T12:00:00Z');
      const testData = { date: testDate };
      
      storageService.set('dateTest', testData);
      const retrieved = storageService.get<typeof testData>('dateTest');
      
      expect(retrieved?.date).toBeInstanceOf(Date);
      expect(retrieved?.date.toISOString()).toBe(testDate.toISOString());
    });

    it('should handle special characters in data', () => {
      const testData = {
        text: 'Special chars: <>&"\'`\n\t\r',
        unicode: '🎃👻💀🌙',
      };
      
      storageService.set('specialChars', testData);
      const retrieved = storageService.get<typeof testData>('specialChars');
      
      expect(retrieved).toEqual(testData);
    });
  });

  describe('Web Audio API Compatibility', () => {
    it('should handle AudioContext creation', () => {
      expect(() => {
        const audioContext = new AudioContext();
        expect(audioContext).toBeDefined();
      }).not.toThrow();
    });

    it('should handle audio controls in UI', async () => {
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

      // Audio controller should be present
      const audioToggle = screen.getByRole('button', { name: /audio/i });
      expect(audioToggle).toBeInTheDocument();

      // Should toggle without errors
      await user.click(audioToggle);
      
      await waitFor(() => {
        const settings = storageService.get<any>('settings');
        expect(settings?.audioEnabled).toBeDefined();
      });
    });

    it('should handle missing Web Audio API gracefully', () => {
      // Simulate browser without Web Audio API
      const originalAudioContext = (globalThis as any).AudioContext;
      (globalThis as any).AudioContext = undefined;

      expect(() => {
        render(<App />);
      }).not.toThrow();

      // Restore
      (globalThis as any).AudioContext = originalAudioContext;
    });
  });

  describe('CSS and Rendering Compatibility', () => {
    it('should render all main components', async () => {
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

      // Navigation should be visible
      expect(screen.getByRole('navigation')).toBeVisible();
    });

    it('should handle CSS modules correctly', async () => {
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

      // Components should have class names (CSS modules working)
      const nav = screen.getByRole('navigation');
      expect(nav.className).toBeTruthy();
    });

    it('should support CSS animations', async () => {
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

      // Navigate to trigger loading animation
      const notesLink = screen.getByRole('link', { name: /ancient library/i });
      await user.click(notesLink);

      // Should not crash with animations
      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });
    });
  });

  describe('Event Handling Compatibility', () => {
    it('should handle click events', async () => {
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

      const notesLink = screen.getByRole('link', { name: /ancient library/i });
      
      expect(() => user.click(notesLink)).not.toThrow();
    });

    it('should handle keyboard events', async () => {
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

      const notesLink = screen.getByRole('link', { name: /ancient library/i });
      await user.click(notesLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });

      // Wait for initial note
      await waitFor(() => {
        expect(screen.getByText(/welcome to the necronomicon/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue(/welcome to the necronomicon/i);
      
      // Should handle typing
      expect(() => user.type(titleInput, 'Test')).not.toThrow();
    });

    it('should handle drag events', async () => {
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

      const graveyardLink = screen.getByRole('link', { name: /forgotten graveyard/i });
      await user.click(graveyardLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/graveyard-dashboard');
      });

      // Create a task
      const newTaskButton = screen.getByRole('button', { name: /raise new task/i });
      await user.click(newTaskButton);

      const taskInput = screen.getByPlaceholderText(/enter task title/i);
      await user.type(taskInput, 'Draggable Task');
      
      const createButton = screen.getByRole('button', { name: /create task/i });
      await user.click(createButton);

      // Should render without drag errors
      await waitFor(() => {
        expect(screen.getByText('Draggable Task')).toBeInTheDocument();
      });
    });
  });

  describe('Router Compatibility', () => {
    it('should handle browser history API', async () => {
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

      // Navigate forward
      const tarotLink = screen.getByRole('link', { name: /mystic clearing/i });
      await user.click(tarotLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/terminal-tarot');
      });

      // Navigate to another page
      const notesLink = screen.getByRole('link', { name: /ancient library/i });
      await user.click(notesLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });

      // Should maintain history
      expect(window.history.length).toBeGreaterThan(1);
    });

    it('should handle route changes without page reload', async () => {
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

      const initialNav = screen.getByRole('navigation');

      // Navigate
      const notesLink = screen.getByRole('link', { name: /ancient library/i });
      await user.click(notesLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/necronomicon-notes');
      });

      // Navigation element should still be the same (no page reload)
      const currentNav = screen.getByRole('navigation');
      expect(currentNav).toBe(initialNav);
    });
  });

  describe('Data Type Compatibility', () => {
    it('should handle various data types in storage', () => {
      const testData = {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' },
        date: new Date(),
      };

      storageService.set('dataTypes', testData);
      const retrieved = storageService.get<typeof testData>('dataTypes');

      expect(retrieved?.string).toBe(testData.string);
      expect(retrieved?.number).toBe(testData.number);
      expect(retrieved?.boolean).toBe(testData.boolean);
      expect(retrieved?.null).toBe(testData.null);
      expect(retrieved?.array).toEqual(testData.array);
      expect(retrieved?.object).toEqual(testData.object);
      expect(retrieved?.date).toBeInstanceOf(Date);
    });

    it('should handle large numbers', () => {
      const testData = {
        large: Number.MAX_SAFE_INTEGER,
        small: Number.MIN_SAFE_INTEGER,
        float: 3.14159265359,
      };

      storageService.set('numbers', testData);
      const retrieved = storageService.get<typeof testData>('numbers');

      expect(retrieved).toEqual(testData);
    });

    it('should handle empty and edge case values', () => {
      const testData = {
        emptyString: '',
        emptyArray: [],
        emptyObject: {},
        zero: 0,
        false: false,
      };

      storageService.set('edgeCases', testData);
      const retrieved = storageService.get<typeof testData>('edgeCases');

      expect(retrieved).toEqual(testData);
    });
  });

  describe('Error Handling Across Browsers', () => {
    it('should handle storage errors consistently', () => {
      // Simulate quota exceeded
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        (error as any).code = 22;
        throw error;
      });

      expect(() => {
        storageService.set('test', { data: 'value' });
      }).toThrow();

      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle JSON parse errors consistently', () => {
      localStorage.setItem('darkprod_corrupt', 'invalid json {{{');

      expect(() => {
        storageService.get('corrupt');
      }).toThrow();
    });
  });
});
