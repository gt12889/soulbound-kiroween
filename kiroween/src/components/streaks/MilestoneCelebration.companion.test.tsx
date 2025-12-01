import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MilestoneCelebration } from './MilestoneCelebration';
import { CompanionProvider } from '../../contexts/CompanionContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AppProvider } from '../../contexts/AppContext';

// Mock the companion context
const mockAddExperience = vi.fn();
const mockInteract = vi.fn();

vi.mock('../../contexts/CompanionContext', async () => {
  const actual = await vi.importActual('../../contexts/CompanionContext');
  return {
    ...actual,
    useCompanion: () => ({
      addExperience: mockAddExperience,
      interact: mockInteract,
      mood: 'happy',
      activeCompanion: 'shadow',
      customNames: {},
      level: 5,
      experience: 100,
      skillTree: {},
      unlockedCompanions: ['shadow'],
      lastInteraction: Date.now(),
      interactionCount: 10,
      interactionsToday: 3,
      ritualProgress: [],
      completedRituals: [],
      currentContext: {
        currentModule: 'home',
        currentActivity: 'idle',
        timeInCurrentActivity: 0,
        recentTasks: [],
        currentMoonPhase: 'full',
        currentTheme: 'default',
        writingSessionDuration: 0,
      },
      themeChangeDialogue: null,
      stats: {
        totalTasks: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalInteractions: 0,
        ritualsCompleted: 0,
        bondedSince: Date.now(),
      },
      switchCompanion: vi.fn(),
      setCustomName: vi.fn(),
      unlockSkill: vi.fn(),
      updateContext: vi.fn(),
      trackTaskCompletion: vi.fn(),
      trackNoteActivity: vi.fn(),
      startNoteTaking: vi.fn(),
      endNoteTaking: vi.fn(),
      audioEnabled: true,
      audioVolume: 70,
      animationIntensity: 'full',
      multiSpiritInteractions: true,
      setAudioEnabled: vi.fn(),
      setAudioVolume: vi.fn(),
      setAnimationIntensity: vi.fn(),
      setMultiSpiritInteractions: vi.fn(),
    }),
  };
});

describe('MilestoneCelebration - Companion Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <CompanionProvider>
              {component}
            </CompanionProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    );
  };

  it('should award XP when milestone celebration is shown', async () => {
    renderWithProviders(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={7}
        show={true}
      />
    );

    await waitFor(() => {
      expect(mockAddExperience).toHaveBeenCalledWith(15); // 7-day milestone = 15 XP
    });
  });

  it('should trigger companion interaction when celebration is shown', async () => {
    renderWithProviders(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={30}
        show={true}
      />
    );

    await waitFor(() => {
      expect(mockInteract).toHaveBeenCalled();
    });
  });

  it('should award correct XP for different milestone levels', async () => {
    const testCases = [
      { days: 3, expectedXP: 10 },
      { days: 7, expectedXP: 15 },
      { days: 14, expectedXP: 25 },
      { days: 30, expectedXP: 50 },
      { days: 60, expectedXP: 100 },
      { days: 100, expectedXP: 200 },
      { days: 365, expectedXP: 500 },
    ];

    for (const { days, expectedXP } of testCases) {
      vi.clearAllMocks();
      const { unmount } = renderWithProviders(
        <MilestoneCelebration
          streakType="taskStreak"
          milestoneDay={days}
          show={true}
        />
      );

      await waitFor(() => {
        expect(mockAddExperience).toHaveBeenCalledWith(expectedXP);
      });

      unmount();
    }
  });

  it('should display companion celebration particles', async () => {
    const { container } = renderWithProviders(
      <MilestoneCelebration
        streakType="focusStreak"
        milestoneDay={14}
        show={true}
      />
    );

    await waitFor(() => {
      const companionCelebration = container.querySelector('[class*="companionCelebration"]');
      expect(companionCelebration).toBeInTheDocument();
    });
  });

  it('should display companion burst particles', async () => {
    const { container } = renderWithProviders(
      <MilestoneCelebration
        streakType="noteStreak"
        milestoneDay={7}
        show={true}
      />
    );

    await waitFor(() => {
      const burstParticles = container.querySelectorAll('[class*="companionBurstParticle"]');
      expect(burstParticles).toHaveLength(16);
    });
  });

  it('should display companion hearts', async () => {
    const { container } = renderWithProviders(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={30}
        show={true}
      />
    );

    await waitFor(() => {
      const hearts = container.querySelectorAll('[class*="companionHeart"]');
      // Should have at least 8 hearts (may have more from other components)
      expect(hearts.length).toBeGreaterThanOrEqual(8);
    });
  });

  it('should display companion message', async () => {
    const { container } = renderWithProviders(
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={true}
      />
    );

    await waitFor(() => {
      const message = container.querySelector('[class*="companionMessage"]');
      expect(message).toBeInTheDocument();
      expect(message?.textContent).toContain('One week streak');
    });
  });

  it('should display appropriate companion message for different milestones', async () => {
    const testCases = [
      { days: 3, expectedText: 'Great start' },
      { days: 7, expectedText: 'on fire' },
      { days: 14, expectedText: 'consistency' },
      { days: 30, expectedText: 'One month milestone' },
      { days: 60, expectedText: 'Two months strong' },
      { days: 100, expectedText: 'century of commitment' },
      { days: 365, expectedText: 'legendary' },
    ];

    for (const { days, expectedText } of testCases) {
      const { container, unmount } = renderWithProviders(
        <MilestoneCelebration
          streakType="taskStreak"
          milestoneDay={days}
          show={true}
        />
      );

      await waitFor(() => {
        const message = container.querySelector('[class*="companionMessage"]');
        expect(message?.textContent?.toLowerCase()).toContain(expectedText.toLowerCase());
      });

      unmount();
    }
  });

  it('should not award XP or trigger interaction when show is false', () => {
    renderWithProviders(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={7}
        show={false}
      />
    );

    expect(mockAddExperience).not.toHaveBeenCalled();
    expect(mockInteract).not.toHaveBeenCalled();
  });

  it('should call onComplete callback after duration', async () => {
    const onComplete = vi.fn();

    renderWithProviders(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={7}
        show={true}
        onComplete={onComplete}
        duration={100} // Short duration for testing
      />
    );

    expect(onComplete).not.toHaveBeenCalled();

    // Wait for callback to be called
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should apply correct color to companion burst particles based on streak type', async () => {
    const testCases = [
      { type: 'loginStreak' as const, color: '#ff6b35' },
      { type: 'taskStreak' as const, color: '#4cc9f0' },
      { type: 'noteStreak' as const, color: '#9d4edd' },
      { type: 'focusStreak' as const, color: '#f72585' },
    ];

    for (const { type, color } of testCases) {
      const { container, unmount } = renderWithProviders(
        <MilestoneCelebration
          streakType={type}
          milestoneDay={7}
          show={true}
        />
      );

      await waitFor(() => {
        const burstParticle = container.querySelector('[class*="companionBurstParticle"]') as HTMLElement;
        expect(burstParticle?.style.getPropertyValue('--burst-color')).toBe(color);
      }, { timeout: 1000 });

      unmount();
    }
  }, 10000); // Increase test timeout for multiple iterations

  it('should only award XP once per celebration', async () => {
    renderWithProviders(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={7}
        show={true}
      />
    );

    await waitFor(() => {
      expect(mockAddExperience).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });

    // XP should only be awarded once even if component stays mounted
    expect(mockAddExperience).toHaveBeenCalledTimes(1);
  });

  it('should render all celebration elements together', async () => {
    const { container } = renderWithProviders(
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={30}
        show={true}
      />
    );

    await waitFor(() => {
      // Main celebration elements
      expect(container.querySelector('[class*="celebrationBurst"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="celebrationContent"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="confettiContainer"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="starBurst"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="glowWaves"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="sparkles"]')).toBeInTheDocument();
      
      // Companion celebration elements
      expect(container.querySelector('[class*="companionCelebration"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="companionBurst"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="companionHearts"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="companionMessage"]')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
