import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StreakCard } from './StreakCard';
import type { StreakInfo, TaskStreakInfo, FocusStreakInfo } from '../../types/streak';

describe('StreakCard', () => {
  const mockLoginStreak: StreakInfo = {
    current: 15,
    longest: 30,
    lastActivityDate: '2024-01-15',
    startDate: '2024-01-01',
  };

  const mockTaskStreak: TaskStreakInfo = {
    current: 7,
    longest: 10,
    lastActivityDate: '2024-01-15',
    startDate: '2024-01-09',
    customGoal: 3,
  };

  const mockFocusStreak: FocusStreakInfo = {
    current: 0,
    longest: 5,
    lastActivityDate: '2024-01-10',
    startDate: '2024-01-15',
    minimumMinutes: 25,
  };

  describe('Display', () => {
    it('should display current streak number', () => {
      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
        />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('days')).toBeInTheDocument();
    });

    it('should show streak type icon', () => {
      const { rerender } = render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
        />
      );

      expect(screen.getByText('🔥')).toBeInTheDocument();

      rerender(
        <StreakCard
          streakType="task"
          streakInfo={mockTaskStreak}
        />
      );

      expect(screen.getByText('⚡')).toBeInTheDocument();
    });

    it('should add "longest streak" subtitle', () => {
      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
        />
      );

      expect(screen.getByText(/Best: 30 days/)).toBeInTheDocument();
    });

    it('should handle singular "day" for longest streak of 1', () => {
      const singleDayStreak: StreakInfo = {
        ...mockLoginStreak,
        longest: 1,
      };

      render(
        <StreakCard
          streakType="login"
          streakInfo={singleDayStreak}
        />
      );

      expect(screen.getByText(/Best: 1 day$/)).toBeInTheDocument();
    });

    it('should show progress to next milestone', () => {
      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
        />
      );

      // Current is 15, next milestone is 30
      expect(screen.getByText(/Next: 30 days/)).toBeInTheDocument();
      expect(screen.getByText('15/30')).toBeInTheDocument();
    });

    it('should not show progress when streak is 0', () => {
      render(
        <StreakCard
          streakType="focus"
          streakInfo={mockFocusStreak}
        />
      );

      expect(screen.queryByText(/Next:/)).not.toBeInTheDocument();
    });

    it('should show broken message when streak is broken', () => {
      render(
        <StreakCard
          streakType="focus"
          streakInfo={mockFocusStreak}
        />
      );

      expect(screen.getByText(/Streak broken. Start again!/)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply active class when isActive is true', () => {
      const { container } = render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
          isActive={true}
          onClick={() => {}}
        />
      );

      const card = container.firstChild as HTMLElement;
      // CSS modules hash class names, so we check if className contains 'active'
      expect(card.className).toMatch(/active/);
    });

    it('should apply broken class when streak is broken', () => {
      const { container } = render(
        <StreakCard
          streakType="focus"
          streakInfo={mockFocusStreak}
        />
      );

      const card = container.firstChild as HTMLElement;
      // CSS modules hash class names, so we check if className contains 'broken'
      expect(card.className).toMatch(/broken/);
    });
  });

  describe('Interactions', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not be interactive when onClick is not provided', () => {
      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
          onClick={() => {}}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute(
        'aria-label',
        'Login Streak: 15 days. Longest: 30 days'
      );
    });

    it('should have proper progressbar attributes', () => {
      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '15');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '30');
      expect(progressbar).toHaveAttribute('aria-label', 'Progress to 30 day milestone');
    });

    it('should be keyboard navigable when clickable', () => {
      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
          onClick={() => {}}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should not be keyboard navigable when not clickable', () => {
      const { container } = render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Different Streak Types', () => {
    it('should render task streak correctly', () => {
      render(
        <StreakCard
          streakType="task"
          streakInfo={mockTaskStreak}
        />
      );

      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('Task Streak')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should render note streak correctly', () => {
      const noteStreak: StreakInfo = {
        current: 5,
        longest: 8,
        lastActivityDate: '2024-01-15',
        startDate: '2024-01-11',
      };

      render(
        <StreakCard
          streakType="note"
          streakInfo={noteStreak}
        />
      );

      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('Note Streak')).toBeInTheDocument();
    });

    it('should render focus streak correctly', () => {
      const focusStreak: FocusStreakInfo = {
        current: 3,
        longest: 5,
        lastActivityDate: '2024-01-15',
        startDate: '2024-01-13',
        minimumMinutes: 25,
      };

      render(
        <StreakCard
          streakType="focus"
          streakInfo={focusStreak}
        />
      );

      expect(screen.getByText('⏱️')).toBeInTheDocument();
      expect(screen.getByText('Focus Streak')).toBeInTheDocument();
    });
  });

  describe('Milestone Progress', () => {
    it('should calculate progress correctly for milestone 7', () => {
      const streak: StreakInfo = {
        current: 5,
        longest: 10,
        lastActivityDate: '2024-01-15',
        startDate: '2024-01-11',
      };

      render(
        <StreakCard
          streakType="login"
          streakInfo={streak}
        />
      );

      expect(screen.getByText(/Next: 7 days/)).toBeInTheDocument();
      expect(screen.getByText('5/7')).toBeInTheDocument();
    });

    it('should calculate progress correctly for milestone 30', () => {
      render(
        <StreakCard
          streakType="login"
          streakInfo={mockLoginStreak}
        />
      );

      expect(screen.getByText(/Next: 30 days/)).toBeInTheDocument();
      expect(screen.getByText('15/30')).toBeInTheDocument();
    });

    it('should show correct milestone when between milestones', () => {
      const streak: StreakInfo = {
        current: 50,
        longest: 60,
        lastActivityDate: '2024-01-15',
        startDate: '2023-11-26',
      };

      render(
        <StreakCard
          streakType="login"
          streakInfo={streak}
        />
      );

      // Next milestone after 50 is 60
      expect(screen.getByText(/Next: 60 days/)).toBeInTheDocument();
    });
  });
});
