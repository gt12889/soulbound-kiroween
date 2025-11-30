import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CompanionDialogue } from './CompanionDialogue';
import type { CompanionType } from '../../types/skillTree';

describe('CompanionDialogue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with message', () => {
      render(
        <CompanionDialogue
          message="Hello, traveler!"
          companionType="shadow"
        />
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should display typewriter effect for message', async () => {
      render(
        <CompanionDialogue
          message="Test message"
          companionType="shadow"
          duration={0}
        />
      );

      // Initially empty or partial
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();

      // After typewriter completes (30ms per character * 12 characters = 360ms)
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      
      // Message should be fully displayed
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render dismiss button when onDismiss provided', () => {
      const onDismiss = vi.fn();
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should not render dismiss button when onDismiss not provided', () => {
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
        />
      );

      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });
  });

  describe('Companion-Colored Styling', () => {
    it('should apply shadow companion styling', () => {
      const { container } = render(
        <CompanionDialogue
          message="Shadow speaks"
          companionType="shadow"
        />
      );

      const dialogueContainer = container.firstChild as HTMLElement;
      expect(dialogueContainer).toBeInTheDocument();
      expect(dialogueContainer.className).toContain('shadow');
    });

    it('should apply forest companion styling', () => {
      const { container } = render(
        <CompanionDialogue
          message="Forest whispers"
          companionType="forest"
        />
      );

      const dialogueContainer = container.firstChild as HTMLElement;
      expect(dialogueContainer).toBeInTheDocument();
      expect(dialogueContainer.className).toContain('forest');
    });

    it('should apply ember companion styling', () => {
      const { container } = render(
        <CompanionDialogue
          message="Ember burns"
          companionType="ember"
        />
      );

      const dialogueContainer = container.firstChild as HTMLElement;
      expect(dialogueContainer).toBeInTheDocument();
      expect(dialogueContainer.className).toContain('ember');
    });

    it('should have unique styling for each companion type', () => {
      const companions: CompanionType[] = ['shadow', 'forest', 'ember'];

      companions.forEach((type) => {
        const { container } = render(
          <CompanionDialogue
            message={`${type} message`}
            companionType={type}
          />
        );
        
        const dialogueContainer = container.firstChild as HTMLElement;
        expect(dialogueContainer.className).toContain(type);
      });
    });
  });

  describe('Position Variants', () => {
    it('should apply top position by default', () => {
      const { container } = render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
        />
      );

      const dialogueContainer = container.firstChild as HTMLElement;
      expect(dialogueContainer.className).toContain('top');
    });

    it('should apply bottom position when specified', () => {
      const { container } = render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          position="bottom"
        />
      );

      const dialogueContainer = container.firstChild as HTMLElement;
      expect(dialogueContainer.className).toContain('bottom');
    });

    it('should apply left position when specified', () => {
      const { container } = render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          position="left"
        />
      );

      const dialogueContainer = container.firstChild as HTMLElement;
      expect(dialogueContainer.className).toContain('left');
    });

    it('should apply right position when specified', () => {
      const { container } = render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          position="right"
        />
      );

      const dialogueContainer = container.firstChild as HTMLElement;
      expect(dialogueContainer.className).toContain('right');
    });
  });

  describe('Speech Bubble Tail', () => {
    it('should show tail by default', () => {
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
        />
      );

      // Check that tail element exists in the document
      const bubbles = document.querySelectorAll('[class*="bubble"]');
      expect(bubbles.length).toBeGreaterThan(0);
    });

    it('should hide tail when showTail is false', () => {
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          showTail={false}
        />
      );

      // Component should still render
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after default duration', async () => {
      const onDismiss = vi.fn();
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Advance past default 5000ms duration + animation time
      await act(async () => {
        vi.advanceTimersByTime(5300);
      });

      expect(onDismiss).toHaveBeenCalled();
    });

    it('should auto-dismiss after custom duration', async () => {
      const onDismiss = vi.fn();
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          duration={2000}
          onDismiss={onDismiss}
        />
      );

      // Advance past 2000ms duration + animation time
      await act(async () => {
        vi.advanceTimersByTime(2300);
      });

      expect(onDismiss).toHaveBeenCalled();
    });

    it('should not auto-dismiss when duration is 0', async () => {
      const onDismiss = vi.fn();
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          duration={0}
          onDismiss={onDismiss}
        />
      );

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Manual Dismiss', () => {
    it('should call onDismiss when dismiss button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onDismiss = vi.fn();
      
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          onDismiss={onDismiss}
          duration={0}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      
      await act(async () => {
        await user.click(dismissButton);
        // Advance past animation time
        vi.advanceTimersByTime(300);
      });

      expect(onDismiss).toHaveBeenCalled();
    });

    it('should add dismissing class when dismissing', async () => {
      const user = userEvent.setup({ delay: null });
      const onDismiss = vi.fn();
      
      const { container } = render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          onDismiss={onDismiss}
          duration={0}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      
      await act(async () => {
        await user.click(dismissButton);
      });

      const dialogueContainer = container.firstChild as HTMLElement;
      expect(dialogueContainer.className).toContain('dismissing');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <CompanionDialogue
          message="Test message"
          companionType="shadow"
          duration={0}
        />
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('aria-live', 'polite');
      expect(tooltip).toHaveAttribute('aria-label', 'shadow companion says: Test message');
    });

    it('should have accessible dismiss button', () => {
      const onDismiss = vi.fn();
      render(
        <CompanionDialogue
          message="Test"
          companionType="shadow"
          onDismiss={onDismiss}
          duration={0}
        />
      );

      const button = screen.getByRole('button', { name: /dismiss/i });
      expect(button).toHaveAttribute('aria-label', 'Dismiss message');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Companion Type Integration', () => {
    it('should work with all companion types', () => {
      const companions: CompanionType[] = ['shadow', 'forest', 'ember'];

      companions.forEach((type) => {
        const { unmount } = render(
          <CompanionDialogue
            message={`${type} companion message`}
            companionType={type}
            duration={0}
          />
        );

        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        unmount();
      });
    });

    it('should display companion-specific aria labels', () => {
      const companions: CompanionType[] = ['shadow', 'forest', 'ember'];

      companions.forEach((type) => {
        const { unmount } = render(
          <CompanionDialogue
            message="Hello"
            companionType={type}
            duration={0}
          />
        );

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('aria-label', `${type} companion says: Hello`);
        unmount();
      });
    });
  });
});
