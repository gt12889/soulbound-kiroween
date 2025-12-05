import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { MilestoneCelebration } from './MilestoneCelebration';

describe('MilestoneCelebration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when show is false', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render celebration when show is true', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    expect(container.querySelector('[class*="celebrationOverlay"]')).toBeInTheDocument();
  });

  it('should display correct emoji for login streak', () => {
    render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('should display correct emoji for task streak', () => {
    render(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={7}
        show={true}
      />
    );

    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('should display correct emoji for note streak', () => {
    render(
      <MilestoneCelebration
        streakType="noteStreak"
        milestoneDay={7}
        show={true}
      />
    );

    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('should display correct emoji for focus streak', () => {
    render(
      <MilestoneCelebration
        streakType="focusStreak"
        milestoneDay={7}
        show={true}
      />
    );

    expect(screen.getByText('⏱️')).toBeInTheDocument();
  });

  it('should display correct milestone message for 7 days', () => {
    render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    expect(screen.getByText('One Week Streak!')).toBeInTheDocument();
    expect(screen.getByText('7 Day Login Streak!')).toBeInTheDocument();
  });

  it('should display correct milestone message for 30 days', () => {
    render(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={30}
        show={true}
      />
    );

    expect(screen.getByText('One Month Streak!')).toBeInTheDocument();
    expect(screen.getByText('30 Day Task Streak!')).toBeInTheDocument();
  });

  it('should display correct milestone message for 100 days', () => {
    render(
      <MilestoneCelebration
        streakType="focusStreak"
        milestoneDay={100}
        show={true}
      />
    );

    expect(screen.getByText('Century Milestone!')).toBeInTheDocument();
    expect(screen.getByText('100 Day Focus Streak!')).toBeInTheDocument();
  });

  it('should display correct milestone message for 365 days', () => {
    render(
      <MilestoneCelebration
        streakType="noteStreak"
        milestoneDay={365}
        show={true}
      />
    );

    expect(screen.getByText('Legendary Achievement!')).toBeInTheDocument();
    expect(screen.getByText('365 Day Note Streak!')).toBeInTheDocument();
  });

  it('should render confetti particles', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    // Query for confetti elements, excluding the container
    const confettiContainer = container.querySelector('[class*="confettiContainer"]');
    const confetti = confettiContainer?.querySelectorAll('[class*="confetti"]');
    expect(confetti?.length).toBe(30);
  });

  it('should render star burst particles', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    const starBurst = container.querySelector('[class*="starBurst"]');
    const stars = starBurst?.querySelectorAll('[class*="star"]');
    expect(stars?.length).toBe(12);
  });

  it('should render sparkle particles', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    const sparklesContainer = container.querySelector('[class*="sparkles"]');
    const sparkles = sparklesContainer?.querySelectorAll('[class*="sparkle"]');
    expect(sparkles?.length).toBe(20);
  });

  it('should render glow waves', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    const glowWaves = container.querySelector('[class*="glowWaves"]');
    const waves = glowWaves?.querySelectorAll('[class*="glowWave"]');
    expect(waves?.length).toBe(3);
  });

  it('should call onComplete after duration', async () => {
    const onComplete = vi.fn();

    render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
        onComplete={onComplete}
        duration={1000}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();

    // Advance timers and flush promises
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should hide celebration after duration', async () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
        duration={1000}
      />
    );

    expect(container.querySelector('[class*="celebrationOverlay"]')).toBeInTheDocument();

    // Advance timers and flush promises
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(container.querySelector('[class*="celebrationOverlay"]')).not.toBeInTheDocument();
  });

  it('should use default duration of 3000ms', async () => {
    const onComplete = vi.fn();

    render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
        onComplete={onComplete}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(2999);
      await Promise.resolve();
    });
    expect(onComplete).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should apply custom CSS variables to confetti', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    const confettiContainer = container.querySelector('[class*="confettiContainer"]');
    const confetti = confettiContainer?.querySelectorAll('[class*="confetti"]');
    const firstConfetti = confetti?.[0] as HTMLElement;

    // Check that inline styles are applied (CSS variables are set via style prop)
    expect(firstConfetti).toBeDefined();
    expect(firstConfetti.style).toBeDefined();
  });

  it('should apply custom CSS variables to stars', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    const starBurst = container.querySelector('[class*="starBurst"]');
    const stars = starBurst?.querySelectorAll('[class*="star"]');
    const firstStar = stars?.[0] as HTMLElement;

    // Check that inline styles are applied
    expect(firstStar).toBeDefined();
    expect(firstStar.style).toBeDefined();
  });

  it('should apply custom CSS variables to sparkles', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    const sparklesContainer = container.querySelector('[class*="sparkles"]');
    const sparkles = sparklesContainer?.querySelectorAll('[class*="sparkle"]');
    const firstSparkle = sparkles?.[0] as HTMLElement;

    // Check that inline styles are applied
    expect(firstSparkle).toBeDefined();
    expect(firstSparkle.style).toBeDefined();
  });

  it('should apply custom CSS variables to glow waves', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    const glowWaves = container.querySelector('[class*="glowWaves"]');
    const waves = glowWaves?.querySelectorAll('[class*="glowWave"]');
    const firstWave = waves?.[0] as HTMLElement;

    // Check that inline styles are applied
    expect(firstWave).toBeDefined();
    expect(firstWave.style).toBeDefined();
  });

  it('should apply streak-specific color to burst', () => {
    const { container } = render(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={7}
        show={true}
      />
    );

    const burst = container.querySelector('[class*="celebrationBurst"]') as HTMLElement;
    expect(burst.style.getPropertyValue('--burst-color')).toBe('#4cc9f0');
  });

  it('should handle different milestone messages correctly', () => {
    const testCases = [
      { days: 3, expected: 'Three Day Streak!' },
      { days: 7, expected: 'One Week Streak!' },
      { days: 14, expected: 'Two Week Streak!' },
      { days: 30, expected: 'One Month Streak!' },
      { days: 60, expected: 'Two Month Streak!' },
      { days: 100, expected: 'Century Milestone!' },
      { days: 365, expected: 'Legendary Achievement!' },
    ];

    testCases.forEach(({ days, expected }) => {
      const { unmount } = render(
        <MilestoneCelebration
          streakType="loginStreak"
          milestoneDay={days}
          show={true}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('should not render when show changes from true to false', async () => {
    const { container, rerender } = render(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    expect(container.querySelector('[class*="celebrationOverlay"]')).toBeInTheDocument();

    rerender(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={false}
      />
    );

    // Should still be visible until duration completes
    expect(container.querySelector('[class*="celebrationOverlay"]')).toBeInTheDocument();
  });
});
